import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { CreatedDrop } from "@/lib/create-drop";
import { ShareFileModal } from "./ShareFileModal";
import { ShareTextModal } from "./ShareTextModal";
import type { ShareKind } from "./ShareOptions";

export function useShareFlow() {
  const navigate = useNavigate();
  const [active, setActive] = useState<ShareKind | null>(null);

  function handleCreated(drop: CreatedDrop) {
    setActive(null);
    // Open the shared drop page immediately
    void navigate({ to: "/drop/$code", params: { code: drop.code } });
  }

  const flow = (
    <>
      <ShareTextModal
        open={active === "text"}
        onOpenChange={(open) => setActive(open ? "text" : null)}
        onCreated={handleCreated}
      />
      <ShareFileModal
        kind="image"
        open={active === "image"}
        onOpenChange={(open) => setActive(open ? "image" : null)}
        onCreated={handleCreated}
      />
      <ShareFileModal
        kind="video"
        open={active === "video"}
        onOpenChange={(open) => setActive(open ? "video" : null)}
        onCreated={handleCreated}
      />
    </>
  );

  return { openShare: setActive, flow };
}
