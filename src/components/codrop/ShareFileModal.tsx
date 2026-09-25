import { useEffect, useState } from "react";
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
import { CODROP, IMAGE_ACCEPT, VIDEO_ACCEPT, formatBytes } from "@/lib/codrop-config";
import { createFileDrop, type CreatedDrop } from "@/lib/create-drop";
import { scanUploadFile } from "@/lib/file-scan";
import { useOnline } from "@/hooks/use-online";
import { UploadDropzone } from "./UploadDropzone";

export function ShareFileModal({
  kind,
  open,
  onOpenChange,
  onCreated,
}: {
  kind: "image" | "video";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (drop: CreatedDrop) => void;
}) {
  const online = useOnline();
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [ttl, setTtl] = useState<1 | 6 | 24>(24);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isImage = kind === "image";
  const accept = isImage ? IMAGE_ACCEPT : VIDEO_ACCEPT;
  const maxBytes = isImage ? CODROP.maxImageBytes : CODROP.maxVideoBytes;
  const allowed = isImage ? CODROP.imageMimeTypes : CODROP.videoMimeTypes;

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setTitle("");
      setPassword("");
      setProgress(0);
      setError(null);
      setBusy(false);
      setScanning(false);
    }
  }, [open]);

  async function pick(next: File) {
    setError(null);
    setProgress(0);
    setFile(null);

    if (!allowed.includes(next.type as never)) {
      setError(isImage ? "Unsupported image format." : "Unsupported video format.");
      return;
    }
    if (next.size > maxBytes) {
      setError(`File is ${formatBytes(next.size)}. Limit ${formatBytes(maxBytes)}.`);
      return;
    }

    setScanning(true);
    try {
      const scan = await scanUploadFile(next, kind);
      if (!scan.ok) {
        setError(scan.reason);
        toast.error(scan.reason);
        return;
      }
      setFile(next);
      if (!title.trim()) setTitle(next.name.replace(/\.[^.]+$/, "").slice(0, 120));
    } finally {
      setScanning(false);
    }
  }

  async function share() {
    if (!file || !title.trim()) return;
    if (!online) {
      toast.error("You are offline. Reconnect to share.");
      return;
    }
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const scan = await scanUploadFile(file, kind);
      if (!scan.ok) {
        setError(scan.reason);
        toast.error(scan.reason);
        return;
      }
      const drop = await createFileDrop(
        kind,
        file,
        setProgress,
        undefined,
        title,
        password || undefined,
        ttl,
      );
      onCreated(drop);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : !navigator.onLine
            ? "You are offline. Reconnect and try again."
            : "Upload failed.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  const canShare = !!file && title.trim().length > 0 && online && !scanning;

  return (
    <Dialog open={open} onOpenChange={(next) => (busy ? null : onOpenChange(next))}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isImage ? "Share Image" : "Share Video"}</DialogTitle>
          <DialogDescription>
            {isImage
              ? `JPG, PNG, WEBP, GIF up to ${formatBytes(maxBytes)}`
              : `MP4, WEBM, MOV up to ${formatBytes(maxBytes)}`}
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
              placeholder={isImage ? "e.g. Team photo" : "e.g. Demo clip"}
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
          accept={accept}
          hint={isImage ? `Images up to ${formatBytes(maxBytes)}` : `Videos up to ${formatBytes(maxBytes)}`}
          file={file}
          disabled={busy || scanning || !online}
          onFile={(f) => void pick(f)}
          onClear={() => {
            setFile(null);
            setProgress(0);
          }}
        >
          {scanning ? (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> Scanning file...
            </p>
          ) : previewUrl && isImage ? (
            <img src={previewUrl} alt="Preview" className="max-h-48 w-full object-contain sm:max-h-64" />
          ) : previewUrl ? (
            <video src={previewUrl} controls playsInline className="max-h-48 w-full bg-black sm:max-h-64" />
          ) : null}
        </UploadDropzone>

        {busy || progress > 0 ? (
          <div className="space-y-1.5">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress >= 100 ? "Creating..." : `Uploading... ${progress}%`}
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
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : error ? (
              "Retry"
            ) : isImage ? (
              "Share Image"
            ) : (
              "Share Video"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
