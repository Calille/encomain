import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "../../hooks/use-toast";
import {
  INTERNAL_TOOLS,
  formatFileSize,
  isValidSemver,
  platformLabel,
  uploadRelease,
  type Platform,
} from "../../lib/tool-releases";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

const RESUMABLE_THRESHOLD_BYTES = 6 * 1024 * 1024;

interface ToolUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultToolSlug?: string;
  onUploaded: () => void;
}

export function ToolUploadDialog({
  open,
  onOpenChange,
  defaultToolSlug = "sentry",
  onUploaded,
}: ToolUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toolSlug, setToolSlug] = useState(defaultToolSlug);
  const [version, setVersion] = useState("");
  const [platform, setPlatform] = useState<Platform>("mac");
  const [file, setFile] = useState<File | null>(null);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [markAsLatest, setMarkAsLatest] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [versionError, setVersionError] = useState<string | null>(null);

  const selectedTool =
    INTERNAL_TOOLS.find((t) => t.slug === toolSlug) ?? INTERNAL_TOOLS[0];

  useEffect(() => {
    if (open) setToolSlug(defaultToolSlug);
  }, [open, defaultToolSlug]);

  const resetForm = () => {
    setToolSlug(defaultToolSlug);
    setVersion("");
    setPlatform("mac");
    setFile(null);
    setReleaseNotes("");
    setMarkAsLatest(true);
    setProgress(0);
    setVersionError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const acceptFile = (next: File | null) => {
    if (!next) return;
    setFile(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = version.trim();
    if (!isValidSemver(trimmed)) {
      setVersionError("Use semver such as 3.0.0 or 3.0.0-beta.1");
      return;
    }
    setVersionError(null);
    if (!file) {
      toast({
        title: "File required",
        description: "Choose an installer file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      await uploadRelease({
        toolSlug: selectedTool.slug,
        toolName: selectedTool.name,
        version: trimmed,
        platform,
        file,
        releaseNotes,
        markAsLatest,
        onProgress: setProgress,
      });
      toast({ title: "Release uploaded", description: `${selectedTool.name} ${trimmed} (${platformLabel(platform)})` });
      resetForm();
      onOpenChange(false);
      onUploaded();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (uploading) return;
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload new release</DialogTitle>
          <DialogDescription>
            Installers are stored privately. Path convention: tool / version / platform / filename.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tool">Tool</Label>
            <Select
              value={toolSlug}
              onValueChange={setToolSlug}
              disabled={uploading}
            >
              <SelectTrigger id="tool">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERNAL_TOOLS.map((tool) => (
                  <SelectItem key={tool.slug} value={tool.slug}>
                    {tool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              placeholder="3.0.0"
              value={version}
              disabled={uploading}
              onChange={(e) => {
                setVersion(e.target.value);
                setVersionError(null);
              }}
              aria-invalid={!!versionError}
            />
            {versionError && (
              <p className="text-xs text-destructive">{versionError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <RadioGroup
              value={platform}
              onValueChange={(v) => setPlatform(v as Platform)}
              className="flex flex-wrap gap-4"
              disabled={uploading}
            >
              {(["mac", "windows", "linux"] as Platform[]).map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <RadioGroupItem value={p} id={`platform-${p}`} />
                  <Label htmlFor={`platform-${p}`} className="font-normal">
                    {platformLabel(p)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>File</Label>
            <div
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border px-4 py-8 text-center transition-colors",
                dragOver && "border-foreground bg-muted/40",
                uploading && "pointer-events-none opacity-60",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) acceptFile(dropped);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
              {file ? (
                <p className="text-sm text-foreground">
                  {file.name}{" "}
                  <span className="text-muted-foreground">
                    ({formatFileSize(file.size)})
                  </span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Drag and drop the installer, or click to browse
                </p>
              )}
              {file && file.size > RESUMABLE_THRESHOLD_BYTES && !uploading && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Large file: will use resumable upload (6MB chunks).
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {uploading && (
              <div className="space-y-1">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">
                  {file && file.size > RESUMABLE_THRESHOLD_BYTES
                    ? `Uploading… ${progress}% (resumable)`
                    : `${progress}%`}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Release notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Markdown supported"
              rows={3}
              value={releaseNotes}
              disabled={uploading}
              onChange={(e) => setReleaseNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
            <Label htmlFor="latest" className="font-normal leading-snug">
              Mark as latest for this platform
            </Label>
            <Switch
              id="latest"
              checked={markAsLatest}
              disabled={uploading}
              onCheckedChange={setMarkAsLatest}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload release"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
