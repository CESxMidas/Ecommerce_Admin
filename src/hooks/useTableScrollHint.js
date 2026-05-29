import { useEffect, useRef } from "react";

export function useTableScrollHint() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const updateScrollHints = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      const canScrollLeft = scrollLeft > 4;
      const canScrollRight = scrollLeft + clientWidth < scrollWidth - 4;

      element.classList.toggle("can-scroll-left", canScrollLeft);
      element.classList.toggle("can-scroll-right", canScrollRight);
    };

    updateScrollHints();
    element.addEventListener("scroll", updateScrollHints, { passive: true });
    window.addEventListener("resize", updateScrollHints);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateScrollHints)
        : null;

    observer?.observe(element);

    return () => {
      element.removeEventListener("scroll", updateScrollHints);
      window.removeEventListener("resize", updateScrollHints);
      observer?.disconnect();
    };
  }, []);

  return ref;
}
