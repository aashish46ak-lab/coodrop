import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { CreatedDrop } from "@/lib/create-drop";
import { saveRecentDrop } from "@/lib/recent-drops";
import { ShareFileModal } from "./ShareFileModal";
import { ShareTextModal } from "./ShareTextModal";
import type { ShareKind } from "./ShareOptions";

export function useShareFlow() {
  const navigate = useNavigate();
  const [active, setActive] = useState<ShareKind | null>(null);

  function handleCreated(drop: CreatedDrop & { type?: ShareKind; title?: string | null }) {
    setActive(null);
    saveRecentDrop({
      code: drop.code,
      expiresAt: drop.expiresAt,
      type: drop.type ?? "text",
      title: drop.title ?? null,
    });
    void navigate({ to: "/drop/$code", params: { code: drop.code } });
  }

  const flow = (
    <>
      <ShareTextModal
        open={active === "text"}
        onOpenChange={(open) => setActive(open ? "text" : null)}
        onCreated={(drop) => handleCreated({ ...drop, type: "text" })}
      />
      <ShareFileModal
        kind="image"
        open={active === "image"}
        onOpenChange={(open) => setActive(open ? "image" : null)}
        onCreated={(drop) => handleCreated({ ...drop, type: "image" })}
      />
      <ShareFileModal
        kind="video"
        open={active === "video"}
        onOpenChange={(open) => setActive(open ? "video" : null)}
        onCreated={(drop) => handleCreated({ ...drop, type: "video" })}
      />
    </>
  );

  return { openShare: setActive, flow };
}
