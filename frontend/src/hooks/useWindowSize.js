import { useEffect, useState } from "react";

export default function useWindowSize() {
  const getSize = () => {
    if (typeof window === "undefined") return { width: 0, height: 0 };
    return { width: window.innerWidth, height: window.innerHeight };
  };

  const [size, setSize] = useState(getSize);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setSize(getSize());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}
