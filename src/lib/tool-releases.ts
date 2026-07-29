/**
 * Client helpers for admin tool installer releases.
 *
 * Storage uploads assume a Pro-tier (or higher) bucket file_size_limit of at least
 * 500MB (524288000 bytes), matching the `tool-installers` bucket migration.
 * Free-tier default is 50MB; installers larger than that will be rejected until
 * the project plan / bucket limit is raised.
 */
import { supabase } from "./supabase";

export type Platform = "mac" | "windows" | "linux";

export interface ToolRelease {
  id: string;
  tool_slug: string;
  tool_name: string;
  version: string;
  platform: Platform;
  file_path: string;
  file_size: number;
  release_notes: string | null;
  is_latest: boolean;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
}

/** Catalogue of internal tools shown on /admin/tools. */
export const INTERNAL_TOOLS: ToolDefinition[] = [
  {
    slug: "sentry",
    name: "Sentry",
    description:
      "Desktop monitoring and diagnostics for The Enclosure team. Download the installer for your platform.",
  },
];

/** Loose semver: 3.0.0, 3.0.0-beta.1, 1.2.3+build.4 */
export const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const BUCKET = "tool-installers";
const MAX_UPLOAD_BYTES = 524288000; // 500MB — matches bucket file_size_limit

function authErrorMessage(error: { message?: string } | null, fallback: string): string {
  const msg = error?.message?.trim();
  if (!msg) return fallback;
  if (/jwt|auth|permission|policy|row-level|rls|not authorized/i.test(msg)) {
    return `Authorisation failed: ${msg}`;
  }
  return msg;
}

export function isValidSemver(version: string): boolean {
  return SEMVER_PATTERN.test(version.trim());
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function platformLabel(platform: Platform): string {
  switch (platform) {
    case "mac":
      return "Mac";
    case "windows":
      return "Windows";
    case "linux":
      return "Linux";
  }
}

function storageObjectPath(
  toolSlug: string,
  version: string,
  platform: Platform,
  filename: string,
): string {
  const safeName = filename.replace(/[/\\]/g, "_");
  return `${toolSlug}/${version}/${platform}/${safeName}`;
}

/**
 * Upload via XHR so we can report progress for large installers.
 * Supabase JS `.upload()` does not expose upload progress events.
 */
function uploadFileWithProgress(
  path: string,
  file: File,
  accessToken: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${baseUrl.replace(/\/$/, "")}/storage/v1/object/${BUCKET}/${path}`;

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable || event.total <= 0) return;
      onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      let message = `Upload failed (${xhr.status})`;
      try {
        const parsed = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = parsed.message || parsed.error || message;
      } catch {
        if (xhr.responseText) message = xhr.responseText.slice(0, 200);
      }
      reject(new Error(message));
    };

    xhr.onerror = () => reject(new Error("Network error while uploading file"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    xhr.send(file);
  });
}

export async function listReleases(toolSlug: string): Promise<ToolRelease[]> {
  const { data, error } = await supabase
    .from("tool_releases")
    .select(
      "id, tool_slug, tool_name, version, platform, file_path, file_size, release_notes, is_latest, uploaded_by, uploaded_at",
    )
    .eq("tool_slug", toolSlug)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(authErrorMessage(error, "Failed to list releases"));
  }

  return (data as ToolRelease[]) ?? [];
}

export async function getLatestRelease(
  toolSlug: string,
  platform: Platform,
): Promise<ToolRelease | null> {
  const { data, error } = await supabase
    .from("tool_releases")
    .select(
      "id, tool_slug, tool_name, version, platform, file_path, file_size, release_notes, is_latest, uploaded_by, uploaded_at",
    )
    .eq("tool_slug", toolSlug)
    .eq("platform", platform)
    .eq("is_latest", true)
    .maybeSingle();

  if (error) {
    throw new Error(authErrorMessage(error, "Failed to load latest release"));
  }

  return (data as ToolRelease | null) ?? null;
}

export async function uploadRelease(input: {
  toolSlug: string;
  toolName: string;
  version: string;
  platform: Platform;
  file: File;
  releaseNotes?: string;
  markAsLatest: boolean;
  onProgress?: (percent: number) => void;
}): Promise<ToolRelease> {
  const version = input.version.trim();
  if (!isValidSemver(version)) {
    throw new Error("Version must be valid semver (e.g. 3.0.0 or 3.0.0-beta.1)");
  }

  if (input.file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File is too large (${formatFileSize(input.file.size)}). Maximum is ${formatFileSize(MAX_UPLOAD_BYTES)}.`,
    );
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token || !session.user) {
    throw new Error(
      authErrorMessage(sessionError, "You must be signed in to upload a release"),
    );
  }

  const filePath = storageObjectPath(
    input.toolSlug,
    version,
    input.platform,
    input.file.name,
  );

  await uploadFileWithProgress(
    filePath,
    input.file,
    session.access_token,
    input.onProgress,
  );

  const { data, error } = await supabase
    .from("tool_releases")
    .insert({
      tool_slug: input.toolSlug,
      tool_name: input.toolName,
      version,
      platform: input.platform,
      file_path: filePath,
      file_size: input.file.size,
      release_notes: input.releaseNotes?.trim() || null,
      is_latest: input.markAsLatest,
      uploaded_by: session.user.id,
    })
    .select(
      "id, tool_slug, tool_name, version, platform, file_path, file_size, release_notes, is_latest, uploaded_by, uploaded_at",
    )
    .single();

  if (error) {
    // Roll back storage object if metadata insert fails
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([filePath]);
    if (removeError) {
      console.error("Failed to roll back storage upload:", removeError);
    }
    throw new Error(authErrorMessage(error, "Failed to save release metadata"));
  }

  return data as ToolRelease;
}

export async function markAsLatest(releaseId: string): Promise<void> {
  const { error } = await supabase
    .from("tool_releases")
    .update({ is_latest: true })
    .eq("id", releaseId);

  if (error) {
    throw new Error(authErrorMessage(error, "Failed to mark release as latest"));
  }
}

export async function updateReleaseNotes(
  releaseId: string,
  notes: string,
): Promise<void> {
  const { error } = await supabase
    .from("tool_releases")
    .update({ release_notes: notes.trim() || null })
    .eq("id", releaseId);

  if (error) {
    throw new Error(authErrorMessage(error, "Failed to update release notes"));
  }
}

export async function deleteRelease(releaseId: string): Promise<void> {
  const { data: release, error: lookupError } = await supabase
    .from("tool_releases")
    .select("id, file_path")
    .eq("id", releaseId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(authErrorMessage(lookupError, "Failed to look up release"));
  }
  if (!release) {
    throw new Error("Release not found");
  }

  const { error: deleteError } = await supabase
    .from("tool_releases")
    .delete()
    .eq("id", releaseId);

  if (deleteError) {
    throw new Error(authErrorMessage(deleteError, "Failed to delete release"));
  }

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([release.file_path]);

  if (storageError) {
    // Row is already gone; surface storage failure so the admin can clean up manually.
    throw new Error(
      `Release deleted from the database, but the file could not be removed from storage: ${storageError.message}`,
    );
  }
}

/**
 * Ask the Edge Function for a short-lived signed URL. Never put file_path in an href.
 */
export async function getDownloadUrl(releaseId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("get-tool-download-url", {
    body: { releaseId },
  });

  if (error) {
    throw new Error(authErrorMessage(error, "Failed to get download URL"));
  }

  const url = (data as { url?: string; error?: string } | null)?.url;
  const remoteError = (data as { error?: string } | null)?.error;
  if (!url) {
    throw new Error(remoteError || "Download URL missing from response");
  }
  return url;
}

/** Resolve display names for uploaded_by ids from public.users. */
export async function resolveUploaderNames(
  userIds: string[],
): Promise<Record<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("id", unique);

  if (error) {
    console.error("Failed to resolve uploader names:", error);
    return {};
  }

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.id] = row.full_name?.trim() || row.email || row.id;
  }
  return map;
}
