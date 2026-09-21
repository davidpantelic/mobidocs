const DESKTOP_BREAKPOINT = 1024;
const MOBILE_BREAKPOINT = 640;

export function useIsDesktop() {
  const { isMobileOrTablet } = useDevice();

  return useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT}px)`, {
    ssrWidth: isMobileOrTablet ? 0 : DESKTOP_BREAKPOINT,
  });
}

export function useIsMobile() {
  const { isMobile } = useDevice();

  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, {
    ssrWidth: isMobile ? 0 : MOBILE_BREAKPOINT,
  });
}
