import { toast } from "sonner";

/** Copies text with a graceful fallback for browsers without the async clipboard API. */
export async function copyToClipboard(value: string, successMessage: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "true");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      if (!ok) throw new Error("copy_failed");
    }
    toast.success(`${successMessage} ✓`);
    return true;
  } catch {
    toast.error("We couldn't copy that. Try selecting and copying manually.");
    return false;
  }
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
