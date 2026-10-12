"use client";

import { useEffect, useState, type RefObject } from "react";

/** true enquanto o elemento estiver (próximo de estar) visível. */
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = "200px", once = false) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = !!entry?.isIntersecting;
        setInView(visible);
        if (visible && once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);
  return inView;
}
