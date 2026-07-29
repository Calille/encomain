import { supabase } from "./supabase";

export type QualificationConfig = {
  maxOverallScore: number;
  minOverallScore: number;
  complianceFailQualifies: boolean;
  securityFailQualifies: boolean;
  requireEmail: boolean;
};

export type SentryConfig = {
  google_places_api_key: string | null;
  pagespeed_api_key: string | null;
  qualification_config: QualificationConfig;
  updated_at?: string;
  updated_by?: string | null;
};

export type SentryTeamMember = {
  id: string;
  full_name: string | null;
  email: string;
  is_owner: boolean;
  is_sentry_user: boolean;
  created_at: string;
  discoveries: number;
  audits: number;
};

export const DEFAULT_QUALIFICATION_CONFIG: QualificationConfig = {
  maxOverallScore: 75,
  minOverallScore: 35,
  complianceFailQualifies: true,
  securityFailQualifies: true,
  requireEmail: true,
};

export async function listSentryUsers(): Promise<SentryTeamMember[]> {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, full_name, email, is_owner, is_sentry_user, created_at")
    .or("is_sentry_user.eq.true,is_owner.eq.true")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const members = (users || []) as Omit<SentryTeamMember, "discoveries" | "audits">[];
  if (members.length === 0) return [];

  const ids = members.map((m) => m.id);

  const [{ data: discoveries }, { data: audits }] = await Promise.all([
    supabase
      .from("sentry_discovered_businesses")
      .select("first_discovered_by")
      .in("first_discovered_by", ids),
    supabase.from("sentry_audits").select("audited_by").in("audited_by", ids),
  ]);

  const discoveryCounts = new Map<string, number>();
  for (const row of discoveries || []) {
    const key = String(row.first_discovered_by);
    discoveryCounts.set(key, (discoveryCounts.get(key) || 0) + 1);
  }

  const auditCounts = new Map<string, number>();
  for (const row of audits || []) {
    const key = String(row.audited_by);
    auditCounts.set(key, (auditCounts.get(key) || 0) + 1);
  }

  return members.map((m) => ({
    ...m,
    is_owner: Boolean(m.is_owner),
    is_sentry_user: Boolean(m.is_sentry_user),
    discoveries: discoveryCounts.get(m.id) || 0,
    audits: auditCounts.get(m.id) || 0,
  }));
}

export async function inviteSentryUser(input: {
  email: string;
  isOwner: boolean;
}): Promise<{ userId: string; wasExisting: boolean }> {
  const { data, error } = await supabase.functions.invoke("invite-sentry-user", {
    body: {
      email: input.email,
      isOwner: input.isOwner,
    },
  });

  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));

  return {
    userId: String(data.userId),
    wasExisting: Boolean(data.wasExisting),
  };
}

export async function revokeSentryAccess(userId: string): Promise<void> {
  const { error } = await supabase.rpc("revoke_sentry_access", {
    target_user_id: userId,
  });
  if (error) throw error;
}

export async function toggleOwner(userId: string, isOwner: boolean): Promise<void> {
  const { error } = await supabase.rpc("set_sentry_owner", {
    target_user_id: userId,
    grant_owner: isOwner,
  });
  if (error) throw error;
}

export async function getSentryConfig(): Promise<SentryConfig> {
  const { data, error } = await supabase
    .from("sentry_config")
    .select(
      "google_places_api_key, pagespeed_api_key, qualification_config, updated_at, updated_by",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;

  const qualification =
    data?.qualification_config &&
    typeof data.qualification_config === "object" &&
    !Array.isArray(data.qualification_config)
      ? ({
          ...DEFAULT_QUALIFICATION_CONFIG,
          ...(data.qualification_config as Partial<QualificationConfig>),
        } as QualificationConfig)
      : DEFAULT_QUALIFICATION_CONFIG;

  return {
    google_places_api_key: data?.google_places_api_key ?? null,
    pagespeed_api_key: data?.pagespeed_api_key ?? null,
    qualification_config: qualification,
    updated_at: data?.updated_at,
    updated_by: data?.updated_by ?? null,
  };
}

export async function updateSentryConfig(
  partial: Partial<{
    google_places_api_key: string | null;
    pagespeed_api_key: string | null;
    qualification_config: QualificationConfig;
  }>,
  updatedBy: string,
): Promise<void> {
  const { error } = await supabase
    .from("sentry_config")
    .update({
      ...partial,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    })
    .eq("id", 1);

  if (error) throw error;
}
