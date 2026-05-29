import { useCallback, useEffect, useState } from "react";

import { BREAKPOINTS } from "../constants/breakpoints";
import { useMediaQuery } from "./useMediaQuery";

export function useSidebar() {
  const isCompact = useMediaQuery(`(max-width: ${BREAKPOINTS.tablet}px)`);
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.mobile}px)`);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.innerWidth > BREAKPOINTS.tablet;
  });

  useEffect(() => {
    setIsSidebarOpen(!isCompact);
  }, [isCompact]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return {
    isSidebarOpen,
    isCompact,
    isMobile,
    setIsSidebarOpen,
    toggleSidebar,
    closeSidebar,
  };
}
