import { useState } from "react";

import type { CreatedDrop } from "@/lib/create-drop";
import { ShareFileModal } from "./ShareFileModal";
import { ShareTextModal } from "./ShareTextModal";
import { SuccessDialog } from "./SuccessDialog";
import type { ShareKind } from "./ShareOptions";

export function useShareFlow() {
  const [active, setActive] = useState<ShareKind | null>(null);
  const [created, setCreated] = useState<CreatedDrop | null>(null);

  function handleCreated(drop: CreatedDrop) {
    setActive(null);
    setCreated(drop);
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
      {created ? (
        <SuccessDialog
          open
          code={created.code}
          expiresAt={created.expiresAt}
          onOpenChange={(open) => {
            if (!open) setCreated(null);
          }}
          onShareAnother={(kind) => {
            setCreated(null);
            setActive(kind);
          }}
        />
      ) : null}
    </>
  );

  return { openShare: setActive, flow };
}
