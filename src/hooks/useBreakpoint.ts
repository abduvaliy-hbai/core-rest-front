import { useEffect, useState } from "react";

export type Breakpoint = "phone" | "tablet" | "desktop";

const PHONE_MAX = 640;
const TABLET_MAX = 1040;

function current(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth <= PHONE_MAX) return "phone";
  if (window.innerWidth <= TABLET_MAX) return "tablet";
  return "desktop";
}

// The panes are sized with inline styles, which no stylesheet rule can override
// without `!important`. Resolving the breakpoint in React instead lets each
// component pick its own style object and keeps the CSS free of overrides.
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(current);

  useEffect(() => {
    const onResize = () => setBreakpoint(current());
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return breakpoint;
}
