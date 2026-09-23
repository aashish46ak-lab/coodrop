import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/codrop-config";

export function UploadDropzone({
  accept,
  hint,
  file,
  disabled,
  onFile,
  onClear,
  children,
}: {
  accept: string;
  hint: string;
  file: File | null;
  disabled?: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
  children?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFile(dropped);
  }

  if (file) {
    return (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-border bg-secondary/40">
          {children}
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onClear}
            className="shrink-0"
          >
            <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
        dragging ? "border-indigo-400 bg-indigo-50/60" : "border-border bg-secondary/30",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const picked = event.target.files?.[0];
          if (picked) onFile(picked);
          event.target.value = "";
        }}
      />
      <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-foreground">
        Drag &amp; drop your file here
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Choose file
      </Button>
    </div>
  );
}
