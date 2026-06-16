import { useEffect, useState } from "react";

type ConnectionLike = {
  effectiveType?: string;
  saveData?: boolean;
};

export type ViewportCapability = {
  coarsePointer: boolean;
  finePointer: boolean;
  isCompact: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  slowConnection: boolean;
};

function readCapability(): ViewportCapability {
  if (typeof window === "undefined") {
    return {
      coarsePointer: false,
      finePointer: false,
      isCompact: false,
      reducedMotion: false,
      saveData: false,
      slowConnection: false,
    };
  }

  const connection = (navigator as Navigator & { connection?: ConnectionLike }).connection;
  const effectiveType = connection?.effectiveType ?? "";
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const isCompact = window.matchMedia("(max-width: 767px)").matches || coarsePointer;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(connection?.saveData);
  const slowConnection = /(^|-)2g$|3g/.test(effectiveType);

  return {
    coarsePointer,
    finePointer,
    isCompact,
    reducedMotion,
    saveData,
    slowConnection,
  };
}

export function useViewportCapability() {
  const [capability, setCapability] = useState<ViewportCapability>(() => readCapability());

  useEffect(() => {
    const queries = [
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(pointer: fine)"),
      window.matchMedia("(max-width: 767px)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];

    const update = () => setCapability(readCapability());
    update();

    queries.forEach((query) => query.addEventListener("change", update));
    window.addEventListener("resize", update, { passive: true });

    return () => {
      queries.forEach((query) => query.removeEventListener("change", update));
      window.removeEventListener("resize", update);
    };
  }, []);

  return capability;
}
