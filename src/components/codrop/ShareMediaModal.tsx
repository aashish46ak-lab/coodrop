import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  CODROP,
  MEDIA_ACCEPT,
  formatBytes,
  isImageMime,
  isVideoMime,
} from "@/lib/codrop-config";
import { createFileDrop, type CreatedDrop } from "@/lib/create-drop";
import { scanUploadFile } from "@/lib/file-scan";
import { useOnline } from "@/hooks/use-online";
import { UploadDropzone } from "./UploadDropzone";

type MediaKind = "image" | "video";

function kindOf(file: File): MediaKind | null {
  if (isImageMime(file.type) || /\.(jpe?g|png|webp|gif)$/i.test(file.name)) return "image";
  if (isVideoMime(file.type) || /\.(mp4|webm|mov|ogv|mkv)$/i.test(file.name)) return "video";
  return null;
}

export function ShareMediaModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (drops: Array<CreatedDrop & { type: MediaKind }>) => void;
}) {
  const online = useOnline();
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [ttl, setTtl] = useState<1 | 6 | 24>(24);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const totalBytes = useMemo(() => files.reduce((s, f) => s + f.size, 0), [files]);

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setTitle("");
      setPassword("");
      setProgress(0);
      setError(null);
      setBusy(false);
      setScanning(false);
      setStatus(null);
    }
  }, [open]);

  async function addFiles(incoming: File[]) {
    setError(null);
    setScanning(true);
    try {
      const next: File[] = [...files];
      for (const file of incoming) {
        if (next.length >= CODROP.maxMediaFiles) {
          setError(`Max ${CODROP.maxMediaFiles} files per share.`);
          break;
        }
        const kind = kindOf(file);
        if (!kind) {
          toast.error(`${file.name}: unsupported format`);
          continue;
        }
        const maxBytes = kind === "image" ? CODROP.maxImageBytes : CODROP.maxVideoBytes;
        if (file.size > maxBytes) {
          toast.error(
            `${file.name} is ${formatBytes(file.size)}. Limit ${formatBytes(maxBytes)}.`,
          );
          continue;
        }
        const scan = await scanUploadFile(file, kind);
        if (!scan.ok) {
          toast.error(`${file.name}: ${scan.reason}`);
          continue;
        }
        if (next.some((f) => f.name === file.name && f.size === file.size)) continue;
        next.push(file);
      }
      setFiles(next);
      if (!title.trim() && next[0]) {
        setTitle(
          next.length === 1
            ? next[0].name.replace(/\.[^.]+$/, "").slice(0, 120)
            : `Media (${next.length})`,
        );
      }
    } finally {
      setScanning(false);
    }
  }

  async function share() {
    if (!files.length || !title.trim()) return;
    if (!online) {
      toast.error("You are offline. Reconnect to share.");
      return;
    }
    setBusy(true);
    setError(null);
    setProgress(0);
    const created: Array<CreatedDrop & { type: MediaKind }> = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        const kind = kindOf(file);
        if (!kind) continue;
        setStatus(`Uploading ${i + 1} of ${files.length}…`);
        const base = Math.round((i / files.length) * 100);
        const drop = await createFileDrop(
          kind,
          file,
          (p) => setProgress(Math.min(99, base + Math.round(p / files.length))),
          undefined,
          files.length === 1 ? title : `${title.trim().slice(0, 80)} (${i + 1})`,
          password || undefined,
          ttl,
        );
        created.push({ ...drop, type: kind });
      }
      setProgress(100);
      if (!created.length) throw new Error("No files were uploaded.");
      onCreated(created);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : !navigator.onLine
            ? "You are offline. Reconnect and try again."
            : "Upload failed.";
      setError(message);
      toast.error(message);
      if (created.length) onCreated(created);
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }

  const canShare = files.length > 0 && title.trim().length > 0 && online && !scanning;

  return (
    <Dialog open={open} onOpenChange={(next) => (busy ? null : onOpenChange(next))}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Media</DialogTitle>
          <DialogDescription>
            Photos and videos. Select multiple. Images up to {formatBytes(CODROP.maxImageBytes)},
            videos up to {formatBytes(CODROP.maxVideoBytes)}.
          </DialogDescription>
        </DialogHeader>

        {!online ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            You are offline. Reconnect to upload.
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              placeholder="e.g. Trip photos"
              disabled={busy}
              className="h-11 text-base sm:h-10 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Password <span className="font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value.slice(0, 64))}
                placeholder="Leave empty for public"
                disabled={busy}
                className="h-11 pr-11 text-base sm:h-10 sm:text-sm"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted-foreground"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Expires after</p>
          <div className="flex gap-2">
            {CODROP.ttlOptions.map((opt) => (
              <button
                key={opt.hours}
                type="button"
                disabled={busy}
                onClick={() => setTtl(opt.hours)}
                className={`min-h-10 flex-1 rounded-full border px-2 py-2 text-xs font-medium sm:flex-none sm:px-3 ${
                  ttl === opt.hours
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <UploadDropzone
          accept={MEDIA_ACCEPT}
          multiple
          files={files}
          hint={`Up to ${CODROP.maxMediaFiles} files · images ${formatBytes(CODROP.maxImageBytes)} · videos ${formatBytes(CODROP.maxVideoBytes)}`}
          disabled={busy || scanning || !online}
          onFiles={(incoming) => void addFiles(incoming)}
          onClear={() => {
            setFiles([]);
            setProgress(0);
          }}
          onRemoveAt={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
        >
          {scanning ? (
            <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> Scanning…
            </p>
          ) : files.length ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              {files.length} file{files.length === 1 ? "" : "s"} · {formatBytes(totalBytes)}
            </p>
          ) : null}
        </UploadDropzone>

        {busy || progress > 0 ? (
          <div className="space-y-1.5">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {status ?? (progress >= 100 ? "Creating…" : `Uploading… ${progress}%`)}
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="flex gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </p>
        ) : null}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="min-h-11 sm:min-h-9"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="min-h-11 sm:min-h-9"
            disabled={busy || !canShare}
            onClick={() => void share()}
          >
            {busy ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Uploading…
              </>
            ) : error ? (
              "Retry"
            ) : files.length > 1 ? (
              `Share ${files.length} files`
            ) : (
              "Share Media"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
