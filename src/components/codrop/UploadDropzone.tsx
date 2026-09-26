import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/codrop-config";

export function UploadDropzone({
  accept,
  hint,
  file,
  files,
  multiple,
  disabled,
  onFile,
  onFiles,
  onClear,
  onRemoveAt,
  children,
}: {
  accept: string;
  hint: string;
  file?: File | null;
  files?: File[];
  multiple?: boolean;
  disabled?: boolean;
  onFile?: (file: File) => void;
  onFiles?: (files: File[]) => void;
  onClear: () => void;
  onRemoveAt?: (index: number) => void;
  children?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const list = files ?? (file ? [file] : []);
  const hasFiles = list.length > 0;

  function takeFiles(listLike: FileList | File[] | null | undefined) {
    if (!listLike || disabled) return;
    const arr = Array.from(listLike);
    if (!arr.length) return;
    if (multiple && onFiles) onFiles(arr);
    else if (onFile && arr[0]) onFile(arr[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    takeFiles(event.dataTransfer.files);
  }

  if (hasFiles) {
    return (
      <div className="space-y-3">
        {children ? (
          <div className="overflow-hidden rounded-xl border border-border bg-secondary/40">
            {children}
          </div>
        ) : null}
        <ul className="space-y-2">
          {list.map((f, index) => (
            <li
              key={`${f.name}-${f.size}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  if (multiple && onRemoveAt) onRemoveAt(index);
                  else onClear();
                }}
                className="shrink-0"
              >
                <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </Button>
            </li>
          ))}
        </ul>
        {multiple ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              Add more
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onClear}>
              Clear all
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              className="sr-only"
              onChange={(event) => {
                takeFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
        ) : null}
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
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          takeFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-foreground">
        {multiple ? "Drag & drop photos or videos" : "Drag & drop your file here"}
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
        {multiple ? "Choose files" : "Choose file"}
      </Button>
    </div>
  );
}
