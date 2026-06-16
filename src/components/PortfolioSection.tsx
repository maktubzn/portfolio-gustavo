/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { BookOpen, Maximize2, Monitor, Smartphone, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CARDS_DATA } from "../data";
import { CardData, CardViewportRect } from "../types";
import ImageLightbox from "./ImageLightbox";
import FlipWords from "./ui/FlipWords";
import { motion, useMotionValue, useSpring } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

const FluidCursor = lazy(() => import("./ui/FluidCursor"));

interface PortfolioItem extends CardData {
  num: string;
  speed: number;
  numSpeed: number;
  accent: string;
  device: "laptop" | "phone" | "monitor";
  roleLabel: string;
}

interface PortfolioSectionProps {
  onProjectOpen: (cardId: number, originRect: CardViewportRect) => void;
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    ...CARDS_DATA[0],
    num: "/001",
    speed: -34,
    numSpeed: -90,
    accent: "#8b5cf6",
    device: "laptop",
    roleLabel: "Web app",
  },
  {
    ...CARDS_DATA[1],
    num: "/002",
    speed: -58,
    numSpeed: -48,
    accent: "#ec4899",
    device: "monitor",
    roleLabel: "TV / jogo",
  },
  {
    ...CARDS_DATA[2],
    num: "/003",
    speed: -42,
    numSpeed: -72,
    accent: "#38bdf8",
    device: "phone",
    roleLabel: "Mobile",
  },
  {
    ...CARDS_DATA[3],
    num: "/004",
    speed: -64,
    numSpeed: -36,
    accent: "#34d399",
    device: "laptop",
    roleLabel: "QA",
  },
  {
    ...CARDS_DATA[4],
    num: "/005",
    speed: -50,
    numSpeed: -60,
    accent: "#f43f5e",
    device: "laptop",
    roleLabel: "SaaS / Salão",
  },
];

function DevicePreview({ item }: { item: PortfolioItem }) {
  if (item.device === "phone") {
    return (
      <div className="relative mx-auto h-full max-h-[440px] w-[58%] min-w-[190px] max-w-[245px] rounded-[34px] border-[3px] border-[#24242a] bg-[#08080a] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="relative h-full overflow-hidden rounded-[26px] border border-black bg-[#101010]">
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" draggable={false} />
          <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-[#08080a]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/12" />
        </div>
      </div>
    );
  }

  if (item.device === "monitor") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="relative w-[92%] max-w-[520px] rounded-lg border-[4px] border-[#232329] bg-[#08080a] p-2 shadow-[0_34px_80px_rgba(0,0,0,0.58)]">
          <div className="aspect-video overflow-hidden rounded-sm border border-black bg-[#101010]">
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" draggable={false} />
          </div>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/0 via-white/4 to-white/10" />
        </div>
        <div className="h-9 w-5 bg-gradient-to-b from-[#303038] to-[#17171b]" />
        <div className="h-2 w-28 rounded-full bg-gradient-to-r from-[#151518] via-[#34343c] to-[#151518]" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="relative w-[92%] max-w-[560px] rounded-t-lg border-[4px] border-[#232329] bg-[#08080a] p-2 shadow-[0_34px_80px_rgba(0,0,0,0.58)]">
        <div className="aspect-[16/10] overflow-hidden rounded-sm border border-black bg-[#101010]">
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#202024]" />
        <div className="absolute inset-0 rounded-t-lg bg-gradient-to-tr from-white/0 via-white/4 to-white/10" />
      </div>
      <div className="relative h-4 w-full max-w-[620px] rounded-b-lg border-t border-[#44444d] bg-gradient-to-b from-[#303038] via-[#1d1d22] to-[#09090b]">
        <div className="absolute left-1/2 top-0 h-1 w-20 -translate-x-1/2 rounded-b bg-[#070707]" />
      </div>
    </div>
  );
}

export default function PortfolioSection({ onProjectOpen }: PortfolioSectionProps) {
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const numRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const imgRefs = useRef<Array<HTMLDivElement | null>>([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.5 });

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    if (isTouch) return;

    const handleMouseMove = (e: any) => {
      const cx = (e.clientX / window.innerWidth) - 0.5;
      const cy = (e.clientY / window.innerHeight) - 0.5;

      mouseX.set(cx * -15);
      mouseY.set(cy * -15);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const scroller = container.closest(".custom-scrollbar") as HTMLElement | null;
      const isCompactViewport = window.matchMedia("(max-width: 767px)").matches;

      if (squareRef.current) {
        gsap.fromTo(
          squareRef.current,
          { rotation: 0 },
          {
            rotation: -360,
            ease: "none",
            scrollTrigger: {
              trigger: squareRef.current,
              scroller,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      const titleChars = container.querySelectorAll(".portfolio-char-inner");
      if (titleChars.length > 0) {
        gsap.fromTo(
          titleChars,
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.045,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: ".portfolio-title",
              scroller,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      itemRefs.current.forEach((itemEl, index) => {
        if (!itemEl) return;

        gsap.fromTo(
          itemEl,
          { y: 0 },
          {
            y: isCompactViewport ? 0 : PORTFOLIO_ITEMS[index].speed,
            ease: "none",
            scrollTrigger: {
              trigger: itemEl,
              scroller,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );

        const preview = itemEl.querySelector(".portfolio-preview");
        if (preview) {
          gsap.fromTo(
            preview,
            { clipPath: "inset(0 100% 0 0)", opacity: 0.35 },
            {
              clipPath: "inset(0 0% 0 0)",
              opacity: 1,
              ease: "power3.out",
              duration: 1.05,
              scrollTrigger: {
                trigger: itemEl,
                scroller,
                start: "top 84%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        const infoText = itemEl.querySelector(".portfolio-info-text");
        if (infoText) {
          gsap.fromTo(
            infoText.children,
            { autoAlpha: 0, y: 14 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: itemEl,
                scroller,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      });

      numRefs.current.forEach((numEl, index) => {
        if (!numEl) return;
        gsap.fromTo(
          numEl,
          { y: 0 },
          {
            y: isCompactViewport ? 0 : PORTFOLIO_ITEMS[index].numSpeed,
            ease: "none",
            scrollTrigger: {
              trigger: numEl,
              scroller,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      imgRefs.current.forEach((imgEl) => {
        if (!imgEl) return;
        gsap.fromTo(
          imgEl,
          { scale: 1.04, y: 18 },
          {
            scale: 1,
            y: isCompactViewport ? 0 : -10,
            ease: "none",
            scrollTrigger: {
              trigger: imgEl,
              scroller,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  const openProject = (item: PortfolioItem, element: HTMLElement | null) => {
    const rect = element?.getBoundingClientRect();
    onProjectOpen(item.id, {
      left: rect?.left ?? window.innerWidth / 2 - 160,
      top: rect?.top ?? window.innerHeight / 2 - 220,
      width: rect?.width ?? 320,
      height: rect?.height ?? 440,
    });
  };

  return (
    <section
      ref={containerRef}
      id="portfolio"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="portfolio-light light-showcase relative z-10 flex flex-col items-center border-t border-white/5 bg-black pt-12 pb-24 text-white md:pt-16 md:pb-36"
    >
      {isHovered && (
        <Suspense fallback={null}>
          <FluidCursor isActive theme="light" className="!absolute inset-0 !z-0 w-full h-full" />
        </Suspense>
      )}
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="relative mb-16 flex items-end justify-between gap-8 md:mb-24">
          <motion.div style={{ x: smoothX, y: smoothY }}>
            <span className="mb-4 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/45">
              <Sparkles size={13} />
              Projetos selecionados
            </span>
            <h2
              className="portfolio-title font-serif text-5xl uppercase tracking-wide text-white md:text-7xl flex flex-wrap items-center gap-x-3 gap-y-1"
              aria-label="Projetos selecionados"
            >
              <span className="portfolio-title__word">
                {"Projet".split("").map((char, index) => (
                  <span key={`p-${index}`} className="inline-block overflow-hidden align-bottom">
                    <span className="portfolio-char-inner inline-block will-change-transform">{char}</span>
                  </span>
                ))}
                <span className="text-stroke font-light">
                  {"os".split("").map((char, index) => (
                    <span key={`l-${index}`} className="inline-block overflow-hidden align-bottom">
                      <span className="portfolio-char-inner inline-block will-change-transform">{char}</span>
                    </span>
                  ))}
                </span>
              </span>
              <FlipWords 
                words={["reais", "completos", "imersivos", "solo"]} 
                className="portfolio-title__flip text-white text-3xl sm:text-4xl md:text-5xl lowercase tracking-normal bg-white/5 px-4 py-1 rounded-md border border-white/5 inline-block align-middle" 
              />
            </h2>
          </motion.div>
          <span
            ref={squareRef}
            className="pointer-events-none absolute right-4 top-2 h-24 w-24 border border-white/10 md:h-36 md:w-36"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-10">
          {PORTFOLIO_ITEMS.map((item, index) => {
            const storyCount = item.story.filter((section) => section.imageUrl).length;

            return (
              <article
                key={item.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="group relative flex w-full md:w-[calc(50%-20px)] lg:w-[calc(33.333%-27px)] min-h-[430px] md:min-h-[480px] flex-col rounded-2xl border border-white/[0.06] bg-[#09090b]/80 p-4 md:p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)] hover:border-white/20 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(0,0,0,0.7)] transition-all duration-500 will-change-transform"
                style={{ boxShadow: `0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px ${item.accent}15` }}
              >
                <button
                  type="button"
                  aria-label={`Ver história de ${item.projectName}`}
                  onClick={(event) => openProject(item, event.currentTarget.closest("article"))}
                  className="portfolio-preview relative h-[285px] sm:h-[320px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#101010] text-left outline-none transition duration-500 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-white/70 md:h-[380px]"
                >
                  <div
                    ref={(el) => {
                      imgRefs.current[index] = el;
                    }}
                    className="h-full w-full will-change-transform"
                  >
                    <DevicePreview item={item} />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 transition duration-500 group-hover:from-black/60" />
                  <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/60 text-white/80 backdrop-blur transition-all duration-300 group-hover:scale-105 group-hover:bg-white group-hover:text-black group-hover:border-white">
                    <BookOpen size={15} />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-white/70 backdrop-blur">
                      {item.roleLabel}
                    </span>
                    <span
                      className="h-2 w-2 rounded-full shadow-[0_0_12px_currentColor]"
                      style={{ color: item.accent, backgroundColor: item.accent }}
                    />
                  </div>
                </button>

                <div className="portfolio-info-text flex flex-1 flex-col pt-5">
                  <div className="mb-2.5 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-white/40 tracking-wider">
                      {item.num}
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/45">
                      {item.category}
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/45">
                      {storyCount} evidências
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-light leading-tight text-white tracking-wide uppercase">
                    {item.projectName}
                  </h3>
                  <p className="mt-2.5 text-xs font-light leading-relaxed text-white/50 group-hover:text-white/70 transition-colors duration-300">
                    {item.story[1]?.text ?? item.projectName}
                  </p>

                  <div className="mt-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-6 border-t border-white/[0.05]">
                    <button
                      type="button"
                      aria-label={`Abrir historia de ${item.projectName}`}
                      onClick={(event) => openProject(item, event.currentTarget.closest("article"))}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-medium text-black transition hover:bg-white/90 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 w-full sm:w-auto justify-center"
                    >
                      <BookOpen size={14} />
                      Ver História
                    </button>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                      <button
                        type="button"
                        aria-label={`Ampliar imagem de ${item.projectName}`}
                        onClick={() => setLightboxItem(item)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 shrink-0"
                      >
                        <Maximize2 size={14} />
                      </button>
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-white/30 font-sans tracking-wider uppercase">
                        {item.device === "phone" ? <Smartphone size={12} /> : <Monitor size={12} />}
                        {item.roleLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {lightboxItem && (
        <ImageLightbox
          imageUrl={lightboxItem.imageUrl}
          title={lightboxItem.projectName}
          category={lightboxItem.category}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </section>
  );
}
