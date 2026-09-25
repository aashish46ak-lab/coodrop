import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Exact ShareTemp logo from your brand PNG */
const MARK_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFkklEQVR42u1WaWxUVRT+zn2vM9NOS9eZacvUakFEIJhAQAhKIUiDQFnENiBEbCoYCaKlRAGF15EYxCqLsoUQ2RTCjOxLoBDKFjRA2ayFCFgCpe10BlraKdOZN+9ef5RCgU41IP4gnF8v9757znfPPd93DvDMnllzE0KCEAxE977/x+DU4rqiPFEQMgCCIghE3HTg7HiEGSYLRlHg4jy5XbNdQ187AyEIROJJAGCwCwYbcdP+U3MQG7uaq2oBd1VNFxw+YUo4bt19vAcAwG6XngQAAoDEDYeS1LbxV0Nu3RzeJ733rsPHLi+j66VbAtGWsYzzDlVpr/S8Uxv8v88AANUg9US9t648vff2I78cGkEpKRM0Y9yn5KxcjgA6piqKAUQ8aJ08Zg2APOp1wXjECwvXW0rfTt0Ut+nkBLXWtV8OCx/CfFqduaSzCiEIeSAUFt57CpdLIDNTezwIimAAyGQ/cdK05fSxtos2WQHAunhbe/OOkkD82iPTAAC7/9QHZc8/M4WCZU8G8gCQ0F+rHO5PSrL72750wbzycI6qk7YJr/8414VlWHNylpQN7uCNW1bwIouIGAYmp3CVeyTNs9dJdACAgKIw2GwP14hdSMgkDUQAEbBxo9Q8a3dQCQIaaWZZfawnu+2JrpiUttcyLt8oBvUvEirKKeA7Cb1hqtDUy0ILlJLEYsGkrgTdWV5dNtb9SfrFoCAAlrhmX3T5+IE37mrLnf/oISFq4rvSSM/IjxdE6bq8ehpgscxbP8I5ZcCBpiOW3Hyj6NR3AwR7Xa4o61o+a+S1O+cEhIB1vsOgGhJnQmbvc0ZhJCSnXH9rVnnOwI1NIKiFN2VwOAiZmVoTCEvuUjPk0DDnvKwrAGCeu/MNijYN5fWeU67cAWvNPxw9CE1tE1ft6lUSE05IeE7gDxePNzZM0SJj3oPP+62oqy7lkVGpckjEHKpzj3ZOG7QRdrtErUozkTDPLdgALbCo6ovBv8Ful8wXDf0owrQf+lBQiAGa67rNX3Juob5Th35Vnw3Z2txF9+7dQ4qKitSEGT935Ekv/8jd5VtIlsOg02dV1R1MQV6ekINEJxCJ5PGKwSukdHC+A4pyHJmZGr7cOxwI5drNag/ThxlIE+/cWpOTZ5627S/TnH0fMfBkTSBGYnLSNWhuFKWNgSHqLTk6ube/pqadVO8epSF2qrXWGlVGdLNV+sTpwZhfUyVV3EBengAA8jccJZ/GmNC1YcyoQ4P6KwAIo6GAMcNszlkfCmhGBHgVY4bR8ZNWJlfMHjJXvfT757hdn6Zx+Xn4AlqbsjIPGnkRTB8ai8Q8Y3cxC/DtlflDZ3ZSinUlti5+U+7myWSMzhAB33mfs3ZmuM5j1KITSlltZZeKxVkXmlyYp+/aQ3JoO1F7Y1TV9xnnLDlb+4vwNgXC75nlmjfs69ZrQCmUYesfME3d9iGTDAtCrhQnljlyb7bUGS1TdzpA1N753ZBuUISExCJCeXeRfGV1eIMlYQ0HDSTOVSZJJAK++c7v0vOCs6C5eikKwWaDZcqug8TkhECNe7Bb57mCFR+oAGAZl2+kmI5zIekmMe+NHuXLx5xBhoPBcb88m7LXtpf0ukTZdb34wUu0AkAQJq6QASC2ssbArF1+kqSQN0X1pW46Fu0NhBq/4Yz6QtKp7FZlZsW68UebaHufDwV031qGXXoQ4L+agszv2ldZsjafAECWcWuz4ifuWW/K3pSFXjmhzXpKcH8ZdqlRcVuYB1pYE4lpS5K0KFMfgYYGEiyKhUasCvG6O191ZJe02NBsjzYrPIBaYQCEecT6MTzWWkigBUzoFpEuZim89V9ddWSX3L2JUigjVZEBQY8aPDj/R65LiM86ZQIgAZBSMk5G3mtaT5lRUAbcty3Q1K6f2VNnfwON43/G34ah9gAAAABJRU5ErkJggg==";

export function DropMark({ className }: { className?: string }) {
  return (
    <img
      src={MARK_SRC}
      alt=""
      width={40}
      height={40}
      className={cn("h-9 w-9 shrink-0 object-contain", className)}
      draggable={false}
    />
  );
}

export function CodropWordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const text =
    size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  const mark = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <DropMark className={mark} />
      <span className={cn("font-bold tracking-tight text-[#1e40af]", text)}>ShareTemp</span>
    </span>
  );
}

export const ShareTempWordmark = CodropWordmark;

export function BrandHeader({
  tagline = "Share temporarily. Keep it simple.",
  className,
}: {
  tagline?: string | null;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <Link
        to="/"
        className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CodropWordmark size="lg" />
      </Link>
      {tagline ? (
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {tagline}
        </p>
      ) : null}
    </header>
  );
}
