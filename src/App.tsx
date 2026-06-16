/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * App Main Component
 * 
 * O que faz: Orquestrador principal do portfólio. Controla a exibição da tela de carregamento, 
 *            inicializa o Lenis smooth scroll global, gerencia o estado dos modais de projetos 
 *            e gerencia a transição/parallax do Hero e do cursor customizado.
 * Onde é usado: Ponto de entrada do React (main.tsx).
 * Hooks/Gatilhos:
 *   - useLenis(): inicializa o smooth scroll sincronizado com GSAP.
 *   - handlePageScroll: gerencia opacidade do Hero e esconde o header ao entrar em #about.
 */

import { Suspense, lazy, useState, useEffect, useRef, useMemo, type MouseEvent } from "react";

import { AnimatePresence, motion, useMotionValue, useSpring, useReducedMotion, useTransform } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import Header from "./components/Header";
import CustomCursor from "./components/CustomCursor";
import AboutSection from "./components/AboutSection";
import QaLabImmersiveTransition from "./components/QaLabImmersiveTransition";
import PortfolioSection from "./components/PortfolioSection";
import ServicesSection from "./components/ServicesSection";
import FooterSection from "./components/FooterSection";
import VideoNarrativeSection from "./components/VideoNarrativeSection";
import LoadingScreen from "./components/LoadingScreen";
import { usePortfolioLoader } from "./hooks/usePortfolioLoader";
import { useLenis } from "./hooks/useLenis";
import { useViewportCapability } from "./hooks/useViewportCapability";
import { CARDS_DATA, HERO_CONTENT } from "./data";
import { CardTransitionPhase, CardViewportRect } from "./types";

gsap.registerPlugin(ScrollTrigger);

const ExpandedModal = lazy(() => import("./components/ExpandedModal"));
const ProjectPresentationView = lazy(() => import("./components/ProjectPresentationView"));
const FluidCursor = lazy(() => import("./components/ui/FluidCursor"));
const Personagem = lazy(() => import("./components/Personagem"));
const ThreeDCarousel = lazy(() => import("./components/ThreeDCarousel"));

export default function App() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<CardTransitionPhase>("idle");
  const [originRect, setOriginRect] = useState<CardViewportRect | null>(null);
  const [isAboutActive, setIsAboutActive] = useState(false);
  const [isLightZoneActive, setIsLightZoneActive] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.5 });
  const pageRef = useRef<HTMLDivElement>(null);
  const heroExitProgress = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();
  const [activeView, setActiveView] = useState<"carousel-modal" | "project-presentation" | "idle">("idle");
  const [isHoveringPortfolio, setIsHoveringPortfolio] = useState(false);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [mobileHeroIndex, setMobileHeroIndex] = useState(0);
  const capability = useViewportCapability();
  const isCompactExperience = capability.isCompact || capability.coarsePointer || capability.reducedMotion;

  const characterWrapperRef = useRef<HTMLDivElement>(null);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);
  const mobileProjectsTrackRef = useRef<HTMLDivElement>(null);

  // 1. Loading Screen & Asset Loading Setup
  const [showLoader, setShowLoader] = useState(true);
  
  // Only preload local card images. Remote portrait/video assets load on demand.
  const imageUrls = useMemo(() => [
    ...CARDS_DATA.map((c) => c.imageUrl)
  ], []);

  // Lightweight loader: fonts + card images only
  const { progress, isReady } = usePortfolioLoader(imageUrls, { mobileImageLimit: 2 });

  const isModalActive = selectedCardId !== null && activeView === "carousel-modal" && transitionPhase !== "idle";
  const isPresentationActive = selectedCardId !== null && activeView === "project-presentation" && transitionPhase !== "idle";

  const heroScale = useTransform(heroExitProgress, [0, 0.9], [1, 0.972]);
  const heroOpacity = useTransform(heroExitProgress, [0, 0.75, 1], [1, 0.82, 0.5]);
  const heroFilter = useTransform(
    heroExitProgress,
    [0, 1],
    ["blur(0px) brightness(1)", "blur(6px) brightness(0.6)"]
  );

  // 0. Initialize Lenis smooth scroll on the viewport
  useLenis();

  // Pause Lenis scrolling when modal or loading screen is active to lock background
  useEffect(() => {
    if (!(window as any).lenis) return;
    if (isModalActive || isPresentationActive || showLoader) {
      (window as any).lenis.stop();
    } else {
      (window as any).lenis.start();
    }
  }, [isModalActive, isPresentationActive, showLoader]);

  // Mouse parallax motion for the main editorial text block
  useEffect(() => {
    // Disable parallax on mobile device sensors to improve performance
    const isTouch = 
      "ontouchstart" in window || 
      navigator.maxTouchPoints > 0 || 
      window.matchMedia("(pointer: coarse)").matches;

    if (isTouch) return;

    const handleMouseMove = (e: any) => {
      if (showLoader) return;
      const cx = (e.clientX / window.innerWidth) - 0.5;
      const cy = (e.clientY / window.innerHeight) - 0.5;
      
      mouseX.set(cx * -15);
      mouseY.set(cy * -15);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [showLoader, mouseX, mouseY]);

  // GSAP Pinning and Zoom transition for Hero section
  useEffect(() => {
    if (showLoader || shouldReduceMotion || isCompactExperience) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#hero-scroll-container",
          start: "top top",
          end: "+=100%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 40,
        },
      });

      // 3D character shrinks and shifts up
      tl.to(characterWrapperRef.current, {
        scale: 0.35,
        y: "-22vh",
        opacity: 0.15,
        ease: "power1.inOut",
      }, 0);

      // Carousel rotates and slides up from below
      tl.fromTo(
        carouselWrapperRef.current,
        {
          y: "85vh",
          scale: 0.35,
          rotationX: 35,
          opacity: 0,
        },
        {
          y: "0vh",
          scale: 1,
          rotationX: 0,
          opacity: 1,
          ease: "power2.out",
        },
        0.05
      );
    });

    return () => ctx.revert();
  }, [isCompactExperience, showLoader, shouldReduceMotion]);

  const handlePageScroll = () => {
    if (showLoader) return;
    const scrollTop = window.scrollY;
    const blurStart = window.innerHeight * 0.98;
    const blurDistance = window.innerHeight * 0.7;
    const next = Math.min(1, Math.max(0, (scrollTop - blurStart) / blurDistance));
    heroExitProgress.set(next);
  };

  useEffect(() => {
    handlePageScroll();
    if (showLoader) return;

    window.addEventListener("scroll", handlePageScroll, { passive: true });
    return () => window.removeEventListener("scroll", handlePageScroll);
  }, [showLoader]);

  useEffect(() => {
    if (showLoader) return;

    const aboutEl = document.getElementById("about");
    const lightZoneIds = ["benefits", "portfolio", "services"];
    const activeLightZones = new Set<string>();

    const aboutObserver = aboutEl
      ? new IntersectionObserver(
          ([entry]) => setIsAboutActive(entry.isIntersecting),
          {
            root: null,
            rootMargin: "-16% 0px -78% 0px",
            threshold: 0,
          }
        )
      : null;

    if (aboutEl && aboutObserver) aboutObserver.observe(aboutEl);

    const lightObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) {
            activeLightZones.add(id);
          } else {
            activeLightZones.delete(id);
          }
        });
        setIsLightZoneActive(activeLightZones.size > 0);
      },
      {
        root: null,
        rootMargin: "-42% 0px -58% 0px",
        threshold: 0,
      }
    );

    lightZoneIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) lightObserver.observe(el);
    });

    return () => {
      aboutObserver?.disconnect();
      lightObserver.disconnect();
    };
  }, [showLoader]);

  const handleCardSelect = (cardId: number, rect: CardViewportRect) => {
    setSelectedCardId(cardId);
    setOriginRect(rect);
    setActiveView("carousel-modal");
    setTransitionPhase("opening");
  };

  const handleProjectOpenPresentation = (cardId: number, rect: CardViewportRect) => {
    setSelectedCardId(cardId);
    setOriginRect(rect);
    setActiveView("project-presentation");
    setTransitionPhase("opening");
  };

  const handleModalCloseComplete = () => {
    setSelectedCardId(null);
    setOriginRect(null);
    setActiveView("idle");
    setTransitionPhase("idle");
  };

  const handleScrollToAbout = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById("about");
    if (target) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(target);
      } else {
        target.scrollIntoView({
          behavior: shouldReduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    }
  };

  const handleMobileCardSelect = (cardId: number, event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    handleCardSelect(cardId, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  };

  const scrollMobileHeroProject = (direction: -1 | 1) => {
    const nextIndex = Math.min(CARDS_DATA.length - 1, Math.max(0, mobileHeroIndex + direction));
    const track = mobileProjectsTrackRef.current;
    const target = track?.querySelector<HTMLElement>(`[data-mobile-project-index="${nextIndex}"]`);

    setMobileHeroIndex(nextIndex);
    target?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
  };

  useEffect(() => {
    const track = mobileProjectsTrackRef.current;
    if (!track || !isCompactExperience) return;

    let frame = 0;
    const updateActiveIndex = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const trackRect = track.getBoundingClientRect();
        const center = trackRect.left + trackRect.width / 2;
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        track.querySelectorAll<HTMLElement>("[data-mobile-project-index]").forEach((item) => {
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.left + rect.width / 2;
          const distance = Math.abs(center - itemCenter);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = Number(item.dataset.mobileProjectIndex ?? 0);
          }
        });

        setMobileHeroIndex(nearestIndex);
      });
    };

    track.addEventListener("scroll", updateActiveIndex, { passive: true });
    updateActiveIndex();

    return () => {
      window.cancelAnimationFrame(frame);
      track.removeEventListener("scroll", updateActiveIndex);
    };
  }, [isCompactExperience]);

  const activeCard = CARDS_DATA.find((c) => c.id === selectedCardId) || null;

  return (
    <div 
      ref={pageRef}
      className={`relative w-full min-h-screen bg-black text-white ${isAboutActive ? "scrollbar-hidden" : ""}`}
    >
      {/* Cyberpunk Loading Screen Overlay */}
      {showLoader && (
        <LoadingScreen
          progress={progress}
          isReady={isReady}
          onFadeComplete={() => {
            setShowLoader(false);
            // Refresh once after the loader exits so pinned sections measure against
            // the final layout without cascading refreshes across child components.
            setTimeout(() => {
              ScrollTrigger.sort();
              ScrollTrigger.refresh();
            }, 260);
          }}
        />
      )}

      {/* Subtle organic SVG-based grain noise texture overlay */}
      <div className={`grain-overlay ${isAboutActive || isLightZoneActive ? "opacity-0 invisible" : "opacity-100"}`} />

      {/* Standalone navigation fluted header */}
      <Header isAboutActive={isAboutActive} isLightZoneActive={isLightZoneActive} />

      {/* Main Immersive Hero Container */}
      <div 
        id="hero-scroll-container" 
        className="w-full relative overflow-visible"
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      >
        <motion.main
          id="hero"
          style={{
            scale: shouldReduceMotion ? 1 : heroScale,
            opacity: isModalActive ? 0.52 : shouldReduceMotion ? 1 : heroOpacity,
            filter: isCompactExperience
              ? "none"
              : isModalActive
                ? "blur(2px) brightness(0.72)"
                : shouldReduceMotion
                  ? "none"
                  : heroFilter,
            transition: "filter 800ms cubic-bezier(0.16, 1, 0.3, 1), transform 800ms cubic-bezier(0.16, 1, 0.3, 1), opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            transformOrigin: "50% 42%",
          }}
          className={`w-full min-h-dvh shrink-0 flex flex-col justify-between relative z-10 pt-24 md:pt-28 lg:pt-24 pb-5 md:pb-6 ${
            isModalActive 
              ? "pointer-events-none" 
              : ""
          }`}
        >
          {/* Editorial Header Section */}
          <motion.div 
            style={{
              x: smoothX,
              y: smoothY,
            }}
            className="w-full max-w-4xl mx-auto px-6 text-center select-none flex flex-col items-center mt-0 md:mt-2"
          >
            {/* Main big serif title */}
            <h1 className="font-serif text-white font-light text-[38px] sm:text-[48px] md:text-[62px] leading-[1.10] md:leading-[1.15] tracking-normal max-w-3xl antialiased">
              {HERO_CONTENT.titleLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < HERO_CONTENT.titleLines.length - 1 && (
                    <>
                      <br className="hidden sm:inline" />
                      <span className="sm:hidden"> </span>
                    </>
                  )}
                </span>
              ))}
            </h1>
          </motion.div>

          {/* Central Stage: Character + Carousel overlay */}
          <div className="w-full relative flex-1 flex items-center justify-center z-20 min-h-[360px] md:min-h-[420px] overflow-visible">
            {/* 3D Character (Rotating Earth) */}
            <div 
              ref={characterWrapperRef} 
              className="absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px] z-10 flex items-center justify-center pointer-events-none select-none transition-opacity duration-300"
            >
              {!isCompactExperience && (
                <Suspense fallback={null}>
                  <Personagem />
                </Suspense>
              )}
            </div>

            {/* Math-driven 3D Rotary Carousel */}
            {isCompactExperience ? (
              <div className="mobile-hero-projects" aria-label="Projetos em destaque">
                <div className="mobile-hero-projects__topline">
                  <span>Projetos</span>
                  <div aria-hidden="true">
                    {mobileHeroIndex + 1}/{CARDS_DATA.length}
                  </div>
                </div>

                <div ref={mobileProjectsTrackRef} className="mobile-hero-projects__track">
                  {CARDS_DATA.map((card, index) => (
                    <button
                      key={card.id}
                      type="button"
                      data-mobile-project-index={index}
                      className="mobile-hero-projects__card"
                      onClick={(event) => handleMobileCardSelect(card.id, event)}
                    >
                      <img
                        src={card.imageUrl}
                        alt=""
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <span>{card.projectName}</span>
                      <small>{card.category}</small>
                    </button>
                  ))}
                </div>

                <div className="mobile-hero-projects__controls">
                  <button
                    type="button"
                    aria-label="Projeto anterior"
                    onClick={() => scrollMobileHeroProject(-1)}
                    disabled={mobileHeroIndex === 0}
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <div className="mobile-hero-projects__dots" aria-hidden="true">
                    {CARDS_DATA.map((card, index) => (
                      <span key={card.id} className={index === mobileHeroIndex ? "is-active" : ""} />
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Proximo projeto"
                    onClick={() => scrollMobileHeroProject(1)}
                    disabled={mobileHeroIndex === CARDS_DATA.length - 1}
                  >
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                ref={carouselWrapperRef} 
                className="w-full relative z-20"
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                  opacity: shouldReduceMotion ? 1 : 0,
                  transform: shouldReduceMotion ? "none" : "translateY(85vh) scale(0.35) rotateX(35deg)",
                }}
              >
                <Suspense fallback={null}>
                  <ThreeDCarousel
                    selectedCardId={selectedCardId}
                    transitionPhase={transitionPhase}
                    onCardSelect={handleCardSelect}
                  />
                </Suspense>
              </div>
            )}
          </div>

          {/* elegant downward indicator */}
          <a 
            href="#about"
            onClick={handleScrollToAbout}
            className="w-full flex flex-col items-center justify-center space-y-2 mt-0 select-none cursor-pointer group no-underline"
          >
            <span className="font-sans text-[10px] tracking-[0.25em] text-white/45 group-hover:text-white uppercase font-medium transition-colors">
              {HERO_CONTENT.scrollLabel}
            </span>
            <div className="flex flex-col items-center">
              {/* Sliding line portal */}
              <div className="w-[1.5px] h-9 bg-white/10 group-hover:bg-white/20 rounded-full relative overflow-hidden transition-colors">
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-white/80 to-transparent animate-scroll-indicator" />
              </div>
              {/* Soft down chevron */}
              <svg 
                className="w-3.5 h-3.5 text-white/40 group-hover:text-white mt-1 animate-bounce transition-colors" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </a>
        </motion.main>
      </div>

      {/* Pass preloaded frames down to AboutSection */}
      <AboutSection />

      <VideoNarrativeSection
        id="tech-impact"
        variant="impact"
        videoSrc="/assets/videos/gsap 4.mp4"
        eyebrow="Tecnologia como impacto"
        title="Tecnologia mudou meu jeito de aprender."
        moments={[
          {
            label: "01 / Curiosidade",
            title: "Começou pequeno.",
            body: "Meus projetos começaram como curiosidade. Com o tempo, entendi que tecnologia não é só criar telas: é observar problemas, testar caminhos e melhorar com clareza.",
          },
          {
            label: "02 / Ambiente real",
            title: "Aprender com gente mais experiente.",
            body: "Agora quero aprender em um ambiente real, com pessoas mais experientes, para transformar estudo em contribuição.",
          },
          {
            label: "03 / Sentido",
            title: "Tecnologia precisa ajudar alguém.",
            body: "Se eu puder entrar nesse meio, quero usar tecnologia para criar soluções que façam sentido para outras pessoas também.",
          },
        ]}
      />

      <QaLabImmersiveTransition />
      <div 
        onMouseEnter={() => setIsHoveringPortfolio(true)} 
        onMouseLeave={() => setIsHoveringPortfolio(false)}
      >
        <PortfolioSection onProjectOpen={handleProjectOpenPresentation} />
      </div>
      <ServicesSection />

      <VideoNarrativeSection
        id="final-vision"
        variant="final"
        videoSrc="/assets/videos/gsap 3.mp4"
        eyebrow="Visão e valor"
        title="Meu valor está em aprender com o problema."
        moments={[
          {
            label: "01 / Honestidade",
            title: "Não estou tentando parecer pronto.",
            body: "Eu não estou tentando parecer pronto. Estou tentando entrar no lugar certo para aprender, testar, errar com responsabilidade e evoluir com orientação.",
          },
          {
            label: "02 / Adaptação",
            title: "O problema ensina o caminho.",
            body: "Quando algo falha, quero entender o motivo, registrar o que aconteceu e melhorar com calma, sem pular etapas.",
          },
          {
            label: "03 / Prática",
            title: "Construir. Testar. Aprender. Melhorar.",
            body: "Esse é o ciclo que quero levar para projetos reais, com orientação técnica e responsabilidade sobre o que estou validando.",
          },
        ]}
        ctas={[
          { href: "#portfolio", label: "Ver projetos" },
          { href: "#footer", label: "Entrar em contato" },
        ]}
      />

      <FooterSection />

      {/* Cinema-Style Expandable Narrative Modal / Project Presentation */}
      <AnimatePresence 
        initial={false}
        onExitComplete={() => {
          if (transitionPhase === "closing") {
            handleModalCloseComplete();
          }
        }}
      >
        <Suspense fallback={null}>
          {activeCard && originRect && isModalActive && (
            <ExpandedModal
              card={activeCard}
              originRect={originRect}
              phase={transitionPhase}
              onOpenComplete={() => setTransitionPhase("open")}
              onCloseRequest={() => setTransitionPhase("closing")}
              onCloseComplete={handleModalCloseComplete}
            />
          )}

          {activeCard && originRect && isPresentationActive && (
            <ProjectPresentationView
              card={activeCard}
              originRect={originRect}
              onCloseRequest={handleModalCloseComplete}
            />
          )}
        </Suspense>
      </AnimatePresence>

      {/* Decoupled custom pointer mouse handler (disabled on touch devices) */}
      {!isAboutActive && !showLoader && !isCompactExperience && capability.finePointer && !capability.reducedMotion && <CustomCursor />}

      {/* Fluid WebGL Smoke Trail Cursor (active only over hero or inside presentation modal) */}
      {!isCompactExperience && capability.finePointer && !capability.reducedMotion && (isHoveringHero || isPresentationActive) && (
        <Suspense fallback={null}>
          <FluidCursor isActive theme="dark" />
        </Suspense>
      )}
    </div>
  );
}
