import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
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
  IMAGE_ACCEPT,
  VIDEO_ACCEPT,
  formatBytes,
} from "@/lib/codrop-config";
import { createFileDrop, type CreatedDrop } from "@/lib/create-drop";
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
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
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
      setProgress(0);
      setError(null);
      setBusy(false);
    }
  }, [open]);

  function pick(next: File) {
    setError(null);
    setProgress(0);
    if (!allowed.includes(next.type as never)) {
      setError(
        isImage
          ? "Unsupported image format. Use JPG, JPEG, PNG, WEBP or GIF."
          : "Unsupported video format. Use MP4, WEBM, MOV, OGV or MKV.",
      );
      setFile(null);
      return;
    }
    if (next.size > maxBytes) {
      setError(`That file is ${formatBytes(next.size)} — the limit is ${formatBytes(maxBytes)}.`);
      setFile(null);
      return;
    }
    setFile(next);
    if (!title.trim()) {
      setTitle(next.name.replace(/\.[^.]+$/, "").slice(0, 120));
    }
  }

  async function share() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const drop = await createFileDrop(kind, file, setProgress, undefined, title);
      onCreated(drop);
    } catch (err) {
      const message = err instanceof Error ? err.message : "The upload failed.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (busy ? null : onOpenChange(next))}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isImage ? "Share Image" : "Share Video"}</DialogTitle>
          <DialogDescription>
            {isImage
              ? `JPG, JPEG, PNG, WEBP, GIF · up to ${formatBytes(maxBytes)}`
              : `MP4, WEBM, MOV, OGV, MKV · up to ${formatBytes(maxBytes)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <label htmlFor="file-title" className="text-xs font-medium text-muted-foreground">
            Title <span className="font-normal">(optional)</span>
          </label>
          <Input
            id="file-title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 120))}
            placeholder={isImage ? "e.g. Team photo, screenshot..." : "e.g. Demo clip, recording..."}
            maxLength={120}
            disabled={busy}
            className="h-10"
          />
        </div>

        <UploadDropzone
          accept={accept}
          hint={
            isImage
              ? `JPG, JPEG, PNG, WEBP or GIF up to ${formatBytes(maxBytes)}`
              : `MP4, WEBM, MOV, OGV or MKV up to ${formatBytes(maxBytes)}`
          }
          file={file}
          disabled={busy}
          onFile={pick}
          onClear={() => {
            setFile(null);
            setProgress(0);
          }}
        >
          {previewUrl && isImage ? (
            <img
              src={previewUrl}
              alt="Selected image preview"
              className="max-h-64 w-full object-contain"
            />
          ) : previewUrl ? (
            <video src={previewUrl} controls className="max-h-64 w-full bg-black" />
          ) : null}
        </UploadDropzone>

        {busy || progress > 0 ? (
          <div className="space-y-1.5">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress >= 100 ? "Creating your drop..." : `Uploading... ${progress}%`}
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={busy || !file} onClick={() => void share()}>
            {busy ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                Uploading...
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
