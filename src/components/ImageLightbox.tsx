/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ImageLightboxProps {
  imageUrl: string;
  title: string;
  category?: string;
  onClose: () => void;
}

export default function ImageLightbox({ imageUrl, title, category, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Imagem ampliada de ${title}`}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 p-4 text-white backdrop-blur-sm"
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Fechar imagem ampliada"
        onClick={onClose}
        className="absolute inset-0 cursor-zoom-out"
      />

      <div className="relative z-10 flex h-full w-full max-w-6xl flex-col justify-center">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {category && (
              <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
                {category}
              </span>
            )}
            <h2 className="mt-1 truncate font-serif text-2xl font-light text-white md:text-3xl">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fechar imagem ampliada"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative max-h-[78vh] overflow-hidden rounded-lg border border-white/12 bg-[#080808] shadow-[0_30px_120px_rgba(0,0,0,0.85)]">
          <img
            src={imageUrl}
            alt={title}
            className="h-full max-h-[78vh] w-full object-contain"
            draggable={false}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
