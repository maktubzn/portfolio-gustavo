import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { CardData, CardTransitionPhase, CardViewportRect } from "../types";

interface ExpandedModalProps {
  card: CardData;
  originRect: CardViewportRect;
  phase: CardTransitionPhase;
  onOpenComplete: () => void;
  onCloseRequest: () => void;
  onCloseComplete: () => void;
}

const transition = {
  duration: 0.52,
  ease: [0.16, 1, 0.3, 1],
} as const;

function getModalRect(): CardViewportRect {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (viewportWidth < 768) {
    return {
      left: 0,
      top: 0,
      width: viewportWidth,
      height: viewportHeight,
    };
  }

  const padding = 40;
  const width = Math.min(1120, viewportWidth - padding * 2);
  const height = Math.min(680, viewportHeight * 0.82);

  return {
    left: (viewportWidth - width) / 2,
    top: (viewportHeight - height) / 2,
    width,
    height,
  };
}

// Map project ID to a background video
const PROJECT_VIDEOS: Record<number, string> = {
  1: "/assets/videos/14264710_1920_1080_30fps.mp4", // GS Shopping
  2: "/assets/videos/gsap 4.mp4",                   // Jogo ETEC
  3: "/assets/videos/gsap 3.mp4",                   // GestMecanic
  4: "/assets/videos/videogsap-scrub-60-all-i.mp4", // QA Lab
  5: "/assets/videos/7565457-hd_2048_1080_25fps.mp4", // GlowAgend
};

export default function ExpandedModal({
  card,
  originRect,
  phase,
  onOpenComplete,
  onCloseRequest,
  onCloseComplete,
}: ExpandedModalProps) {
  console.log("[REACT COMPONENT] ExpandedModal rendered with phase:", phase);
  const [targetRect, setTargetRect] = useState<CardViewportRect>(() => getModalRect());
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const updateTargetRect = () => setTargetRect(getModalRect());
    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    return () => window.removeEventListener("resize", updateTargetRect);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && phase === "open") {
        onCloseRequest();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCloseRequest, phase]);

  useEffect(() => {
    if (phase === "opening") {
      const duration = shouldReduceMotion ? 150 : 550;
      const timer = setTimeout(() => {
        onOpenComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [phase, onOpenComplete, shouldReduceMotion]);

  useEffect(() => {
    if (phase === "closing") {
      const duration = shouldReduceMotion ? 150 : 550;
      const timer = setTimeout(() => {
        onCloseComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [phase, onCloseComplete, shouldReduceMotion]);

  const animatedRect = phase === "closing" ? originRect : targetRect;
  const isOpen = phase === "open";
  const canRequestClose = phase !== "closing";
  const shellTransition = shouldReduceMotion
    ? { duration: 0.12 }
    : phase === "closing"
      ? { duration: 0.46, ease: transition.ease, delay: 0.06 }
      : transition;

  const shellStyles = useMemo(
    () => ({
      x: animatedRect.left,
      y: animatedRect.top,
      width: animatedRect.width,
      height: animatedRect.height,
      borderRadius: phase === "closing" ? 22 : window.innerWidth < 768 ? 0 : 20,
    }),
    [animatedRect, phase]
  );

  const videoSrc = PROJECT_VIDEOS[card.id] || "";

  return (
    <div role="dialog" aria-modal="true" aria-label={`Detalhes de ${card.projectName}`} className="fixed inset-0 z-50">
      {/* Background Overlay */}
      <motion.button
        type="button"
        aria-label="Fechar detalhes"
        onClick={() => {
          if (canRequestClose) onCloseRequest();
        }}
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "closing" ? 0 : 1 }}
        transition={{ duration: shouldReduceMotion ? 0.1 : 0.3, ease: "easeOut" }}
      />

      {/* Main Dialog Shell */}
      <motion.div
        initial={{
          x: originRect.left,
          y: originRect.top,
          width: originRect.width,
          height: originRect.height,
          borderRadius: 22,
          opacity: 1,
        }}
        animate={{
          ...shellStyles,
          opacity: 1,
        }}
        transition={shellTransition}
        className="fixed left-0 top-0 overflow-hidden border border-white/[0.08] bg-[#0c0c0e] shadow-[0_45px_100px_rgba(0,0,0,0.95)]"
      >
        {/* Cover image during opening/closing transition */}
        <motion.img
          src={card.imageUrl}
          alt={card.projectName}
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
          draggable={false}
          initial={{ opacity: 1 }}
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: shouldReduceMotion ? 0.08 : 0.2, ease: "easeOut" }}
        />

        {/* Cinematic Split Screen Container */}
        <motion.div
          className="absolute inset-0 flex flex-col bg-[#0c0c0e] text-white md:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0.08 : 0.25, ease: "easeOut" }}
          aria-hidden={!isOpen}
        >
          {/* Left Side: Cinema Media Preview */}
          <div className="relative h-[28vh] w-full overflow-hidden border-b border-white/[0.06] md:h-full md:w-[44%] md:border-b-0 md:border-r">
            {videoSrc ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover select-none opacity-50"
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            ) : (
              <img
                src={card.imageUrl}
                alt={card.projectName}
                className="h-full w-full object-cover select-none opacity-40"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            )}
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-black/30 md:bg-gradient-to-r md:from-transparent md:to-[#0c0c0e]/80" />
            <div className="absolute left-6 bottom-6 md:left-8 md:bottom-8 z-10 pointer-events-none">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50 border border-white/10 bg-black/40 backdrop-blur px-2.5 py-1 rounded">
                Live Preview
              </span>
            </div>
          </div>

          {/* Right Side: Scrollable Case Study Info */}
          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#0c0c0e]">
            {/* Close Button */}
            <button
              onClick={onCloseRequest}
              aria-label="Fechar detalhes"
              disabled={!canRequestClose}
              className="absolute right-6 top-6 z-20 rounded-full border border-white/10 bg-white/5 p-2 text-white/50 transition-all duration-300 hover:rotate-90 hover:bg-white hover:text-black focus:outline-none disabled:pointer-events-none"
            >
              <X size={16} />
            </button>

            {/* Header Content */}
            <div className="flex flex-col border-b border-white/[0.05] p-6 pb-5 md:p-8 md:pb-6 mt-1 md:mt-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/40">
                {card.category}
              </span>
              <h2 className="mt-1 font-serif text-2xl font-light tracking-wide text-white md:text-3xl uppercase">
                {card.projectName}
              </h2>
            </div>

            {/* Scrollable Story Panel */}
            <div
              data-lenis-prevent
              className="custom-scrollbar flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth pb-16"
            >
              <div className="space-y-4">
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/40 block">
                  Visão Geral do Projeto
                </span>
                <p className="text-sm font-light leading-relaxed text-white/70">
                  {card.story[0]?.text || "Este projeto aborda o desenvolvimento de uma interface inovadora e interações fluidas para entregar uma excelente experiência do usuário."}
                </p>
              </div>

              {/* Development Phases */}
              <div className="pt-4 space-y-6">
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/40 block">
                  Etapas e Desafios
                </span>
                <div className="space-y-4 relative border-l border-white/[0.08] pl-4 md:pl-5 ml-1">
                  {card.story.slice(1).map((section) => (
                    <div key={section.phase} className="relative space-y-1">
                      {/* Node point */}
                      <div className="absolute -left-[21px] md:-left-[25px] top-1.5 h-2 w-2 rounded-full bg-white/30 border border-[#0c0c0e]" />
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30 block">
                        {section.phase}
                      </span>
                      <h4 className="text-sm font-medium text-white/90">
                        {section.title}
                      </h4>
                      <p className="text-xs font-light leading-relaxed text-white/50">
                        {section.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
