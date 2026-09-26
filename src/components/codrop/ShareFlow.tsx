import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import type { CreatedDrop } from "@/lib/create-drop";
import { saveRecentDrop } from "@/lib/recent-drops";
import { addToSessionFolder } from "@/lib/session-folder";
import { ShareMediaModal } from "./ShareMediaModal";
import { ShareTextModal } from "./ShareTextModal";
import type { ShareKind } from "./ShareOptions";

export function useShareFlow(_opts?: { stayOnFolder?: boolean }) {
  const navigate = useNavigate();
  const [active, setActive] = useState<ShareKind | null>(null);

  function handleCreated(
    drop: CreatedDrop & { type?: "text" | "image" | "video" },
    opts?: { navigateToFolder?: boolean },
  ) {
    setActive(null);
    const type = drop.type ?? "text";
    saveRecentDrop({
      code: drop.code,
      expiresAt: drop.expiresAt,
      type,
      title: drop.title,
      batchCode: drop.batchCode,
    });
    addToSessionFolder(
      {
        code: drop.code,
        title: drop.title,
        type,
        expiresAt: drop.expiresAt,
      },
      drop.batchCode,
    );
    toast.success(`Shared · ${drop.code}`);
    if (opts?.navigateToFolder !== false) {
      void navigate({ to: "/folder/$code", params: { code: drop.batchCode } });
    }
  }

  function handleMediaCreated(drops: Array<CreatedDrop & { type: "image" | "video" }>) {
    setActive(null);
    if (!drops.length) return;
    for (const drop of drops) {
      saveRecentDrop({
        code: drop.code,
        expiresAt: drop.expiresAt,
        type: drop.type,
        title: drop.title,
        batchCode: drop.batchCode,
      });
      addToSessionFolder(
        {
          code: drop.code,
          title: drop.title,
          type: drop.type,
          expiresAt: drop.expiresAt,
        },
        drop.batchCode,
      );
    }
    const last = drops[drops.length - 1]!;
    toast.success(
      drops.length === 1 ? `Shared · ${last.code}` : `Shared ${drops.length} files · ${last.batchCode}`,
    );
    void navigate({ to: "/folder/$code", params: { code: last.batchCode } });
  }

  const flow = (
    <>
      <ShareTextModal
        open={active === "text"}
        onOpenChange={(open) => setActive(open ? "text" : null)}
        onCreated={(drop) => handleCreated({ ...drop, type: "text" })}
      />
      <ShareMediaModal
        open={active === "media"}
        onOpenChange={(open) => setActive(open ? "media" : null)}
        onCreated={handleMediaCreated}
      />
    </>
  );

  return { openShare: setActive, flow };
}
