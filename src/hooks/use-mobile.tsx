import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

/**
 * Subscribe to a media query as an external store.
 *
 * These used to be useState plus an effect that set the initial value on mount.
 * That meant the first render always answered `false` — desktop — and the real
 * answer arrived one render later, so anything gated on mobile flashed the
 * wrong layout before correcting itself. Reading the query during render
 * removes the flash, and removes the setState-in-effect the compiler rules
 * flag.
 */
const subscribeTo = (query: string) => (onChange: () => void) => {
  const mql = window.matchMedia(query)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

const useMediaQuery = (query: string) =>
  React.useSyncExternalStore(
    React.useMemo(() => subscribeTo(query), [query]),
    () => window.matchMedia(query).matches,
    // Only reached under a server render, which this app never does. Present so
    // the hook degrades to "desktop" rather than throwing if that ever changes.
    () => false,
  )

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}

export function useIsMobileOrTablet() {
  return useMediaQuery(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
}

export function useBreakpoint(): "mobile" | "tablet" | "desktop" {
  const isMobile = useIsMobile()
  const isTablet = useIsMobileOrTablet()
  if (isMobile) return "mobile"
  if (isTablet) return "tablet"
  return "desktop"
}
