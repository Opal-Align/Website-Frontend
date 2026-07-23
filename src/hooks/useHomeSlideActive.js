import { useState, useEffect } from "react";
import useScrollContainer from "./useScrollContainer";

export default function useHomeSlideActive(sectionRef) {
  const containerRef = useScrollContainer();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container || !sectionRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      {
        root: container,
        threshold: 0.5,
      },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [containerRef, sectionRef]);

  return active;
}
