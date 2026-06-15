import { useState, useEffect } from "react";

/**
 * Lightweight portfolio preloader.
 * Only loads fonts + card/hero images (NOT the 240 About frames).
 * The About section loads its own frames lazily when the user scrolls to it.
 */
export function usePortfolioLoader(imageUrls: string[]) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    const totalAssets = imageUrls.length + 1; // +1 for fonts
    let loadedCount = 0;

    const onAssetLoaded = () => {
      if (!active) return;
      loadedCount++;
      const pct = Math.round((loadedCount / totalAssets) * 100);
      setProgress(pct);
      if (loadedCount >= totalAssets) {
        setIsReady(true);
      }
    };

    // 1. Load Fonts
    if (document.fonts) {
      document.fonts.ready
        .then(() => onAssetLoaded())
        .catch(() => onAssetLoaded());
    } else {
      onAssetLoaded();
    }

    // 2. Load card/hero images
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => onAssetLoaded();
      img.onerror = () => {
        console.warn("Failed to preload image:", url);
        onAssetLoaded();
      };
    });

    return () => {
      active = false;
    };
  }, [imageUrls]);

  return { progress, isReady };
}
