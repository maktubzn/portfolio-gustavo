import { useState, useEffect } from "react";

type ConnectionLike = {
  effectiveType?: string;
  saveData?: boolean;
};

type PortfolioLoaderOptions = {
  desktopImageLimit?: number;
  mobileImageLimit?: number;
};

/**
 * Critical portfolio preloader.
 * Loads fonts and a small image budget only; videos and below-the-fold media
 * stay lazy so mobile does not block on cinematic assets.
 */
export function usePortfolioLoader(imageUrls: string[], options: PortfolioLoaderOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    let settled = false;
    let loadedCount = 0;

    const connection = (navigator as Navigator & { connection?: ConnectionLike }).connection;
    const isMobileBudget =
      window.matchMedia("(max-width: 767px), (pointer: coarse)").matches ||
      Boolean(connection?.saveData) ||
      /(^|-)2g$|3g/.test(connection?.effectiveType ?? "");
    const imageLimit = isMobileBudget
      ? options.mobileImageLimit ?? 2
      : options.desktopImageLimit ?? imageUrls.length;
    const criticalImages = imageUrls.slice(0, Math.max(0, imageLimit));
    const totalAssets = criticalImages.length + 1; // +1 for fonts
    const timeoutMs = isMobileBudget ? 2600 : 4200;

    const finish = () => {
      if (!active || settled) return;
      settled = true;
      setProgress(100);
      setIsReady(true);
    };

    const onAssetLoaded = () => {
      if (!active || settled) return;
      loadedCount++;
      const pct = Math.round((loadedCount / totalAssets) * 100);
      setProgress(pct);
      if (loadedCount >= totalAssets) {
        finish();
      }
    };

    const safetyTimer = window.setTimeout(finish, timeoutMs);

    // 1. Load Fonts
    if (document.fonts) {
      document.fonts.ready
        .then(() => onAssetLoaded())
        .catch(() => onAssetLoaded());
    } else {
      onAssetLoaded();
    }

    // 2. Load only critical hero/card images within the device budget.
    criticalImages.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => onAssetLoaded();
      img.onerror = () => onAssetLoaded();
    });

    return () => {
      active = false;
      window.clearTimeout(safetyTimer);
    };
  }, [imageUrls, options.desktopImageLimit, options.mobileImageLimit]);

  return { progress, isReady };
}
