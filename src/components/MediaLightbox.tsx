/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface MediaLightboxItem {
  src: string;
  title: string;
  caption?: string;
}

interface MediaLightboxProps {
  items: MediaLightboxItem[];
  currentIndex: number;
  accentColor?: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export default function MediaLightbox({
  items,
  currentIndex,
  accentColor = "#ffffff",
  onIndexChange,
  onClose,
}: MediaLightboxProps) {
  const item = items[currentIndex];
  const hasMultiple = items.length > 1;

  const goTo = (direction: -1 | 1) => {
    if (!hasMultiple) return;
    const next = (currentIndex + direction + items.length) % items.length;
    onIndexChange(next);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goTo(-1);
      if (event.key === "ArrowRight") goTo(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, hasMultiple, onClose]);

  if (!item) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Midia ampliada: ${item.title}`}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/96 p-4 text-white backdrop-blur-md"
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Fechar midia ampliada"
        onClick={onClose}
        className="absolute inset-0 cursor-zoom-out"
      />

      <div className="relative z-10 flex h-full w-full max-w-7xl flex-col justify-center">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-white/42">
              {String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <h2 className="mt-1 truncate font-serif text-2xl font-light text-white md:text-3xl">
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fechar midia ampliada"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#080808] shadow-[0_30px_140px_rgba(0,0,0,0.9)]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          />
          <img
            src={item.src}
            alt={item.title}
            className="h-full max-h-[76vh] w-full object-contain"
            draggable={false}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="max-w-2xl text-sm font-light leading-relaxed text-white/54">
            {item.caption ?? "Evidencia visual do projeto."}
          </p>

          {hasMultiple && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Midia anterior"
                onClick={() => goTo(-1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Proxima midia"
                onClick={() => goTo(1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
