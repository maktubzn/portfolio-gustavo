/**
 * AboutSection
 *
 * O que faz: Exibe a seção de biografia de Gustavo Alves usando uma timeline de vídeo
 *            suave sincronizada com a rolagem do usuário (video scrubbing).
 * Onde é usado: App.tsx (no fluxo principal de seções).
 * Props: nenhuma.
 * Emits: nenhum.
 * Dependências: GSAP, ScrollTrigger, useGSAP, (window as any).lenis.
 * Cuidados: O vídeo deve ser codificado com keyframe em todos os frames (GOP=1, no-bframes)
 *           e as timelines de GSAP usam ease: "none" para evitar descompassos físicos.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "/assets/videos/about-bg.mp4";

const ABOUT_CONFIG = {
  desktopScrollVh: 230,
  mobileScrollVh: 185,
} as const;

const COPY_BLOCKS = [
  {
    id: "vision",
    eyebrow: "01",
    title: "Por fora, uma trajetória simples.",
    body: "Sou Gustavo dos Santos Alves, tenho 17 anos, moro em Mairiporã/SP e estudo Informática para Internet na ETEC de Franco da Rocha.",
    start: 0.02,
    exit: 0.18,
  },
  {
    id: "perspective",
    eyebrow: "02",
    title: "Por dentro, curiosidade e construção.",
    body: "Minha trajetória começou pela vontade de entender como sistemas funcionam e evoluiu com estudos de web, mobile, automação e hardware.",
    start: 0.23,
    exit: 0.42,
  },
  {
    id: "surface",
    eyebrow: "03",
    title: "Testar mudou meu olhar.",
    body: "Nos meus próprios projetos percebi que uma funcionalidade funcionando uma vez não significa que ela está pronta.",
    start: 0.48,
    exit: 0.62,
  },
  {
    id: "depth",
    eyebrow: "04",
    title: "Quero aprender QA com projetos reais.",
    body: "Busco minha primeira oportunidade como Jovem Aprendiz em tecnologia, com interesse em testes manuais, documentação simples e validação de interfaces.",
    start: 0.67,
    exit: 0.78,
  },
] as const;

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function getInitialReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getInitialCompactViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const copyRefs = useRef<Array<HTMLDivElement | null>>([]);
  const finalCopyRef = useRef<HTMLDivElement>(null);

  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [compactViewport, setCompactViewport] = useState(getInitialCompactViewport);

  // Monitor viewport adjustments
  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const updateCompact = () => setCompactViewport(compactQuery.matches);

    updateCompact();
    compactQuery.addEventListener("change", updateCompact);

    return () => {
      compactQuery.removeEventListener("change", updateCompact);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldLoadVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "900px 0px", threshold: 0 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldLoadVideo]);

  // Monitor and extract video duration on loadedmetadata
  useEffect(() => {
    if (!shouldLoadVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setVideoDuration(video.duration);
        setIsVideoLoaded(true);

        // Prime the hardware decoder (play and pause immediately) to avoid black screen or lag on first seek
        video.play().then(() => {
          video.pause();
        }).catch(() => {});
      }
    };

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [shouldLoadVideo]);

  // GSAP ScrollTrigger timeline configuration
  useGSAP(
    () => {
      const isMobile = isMobileDevice();
      const reducedMotion = getInitialReducedMotion();

      // Reduced motion bypass
      if (reducedMotion) {
        gsap.set(copyRefs.current.filter(Boolean), { autoAlpha: 0, y: 0 });
        gsap.set(finalCopyRef.current, { autoAlpha: 1, y: 0, scale: 1 });
        const video = videoRef.current;
        if (video) {
          video.currentTime = videoDuration || 5;
          video.pause();
        }
        return;
      }

      const section = sectionRef.current;
      const video = videoRef.current;
      if (!section || !video) return;

      // Ensure timeline/pin always gets created even if duration isn't loaded yet
      const currentDuration = (!isNaN(videoDuration) && videoDuration > 0) 
        ? videoDuration 
        : (video.duration || 10);

      const scrollVh = isMobile ? ABOUT_CONFIG.mobileScrollVh : ABOUT_CONFIG.desktopScrollVh;
      const scrollDistance = Math.round(window.innerHeight * (scrollVh / 100));

      // Initialize hidden elements
      gsap.set(copyRefs.current.filter(Boolean), { autoAlpha: 0, y: 15 });
      gsap.set(finalCopyRef.current, { autoAlpha: 0, y: 15 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${scrollDistance}`,
          scrub: 0.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          refreshPriority: 30,
          invalidateOnRefresh: true,
        },
      });

      // Scene 1: Entrance Zoom-Out & Blur-Out (0% -> 30%)
      tl.fromTo(
        video,
        { scale: 1.8, filter: "blur(8px)", transformOrigin: "50% 30%" },
        { scale: 1.20, filter: "blur(0px)", transformOrigin: "50% 30%", duration: 0.3, ease: "power2.out" },
        0
      );

      // Scene 2: Video scrubbing using time proxy object (18% -> 72% for Desktop)
      if (!isMobile) {
        const videoState = { time: 0 };
        tl.to(
          videoState,
          {
            time: currentDuration,
            duration: 0.54,
            ease: "none", // Obligatory for frame-exact seeking
            onUpdate: () => {
              const target = videoState.time;
              if (Math.abs(video.currentTime - target) > 0.01) {
                video.currentTime = target;
              }
            },
          },
          0.18
        );
      } else {
        // Fallback mobile: play video in background loop naturally
        video.play().catch(() => {});
      }

      // Scene 3: Copy Blocks entrance & exit animations
      COPY_BLOCKS.forEach((block, index) => {
        const el = copyRefs.current[index];
        if (!el) return;

        const words = el.querySelectorAll(".cinematic-about__word");
        const eyebrow = el.querySelector(".cinematic-about__eyebrow");
        const body = el.querySelector(".cinematic-about__body");

        // Entrance
        tl.to(el, { autoAlpha: 1, duration: 0.05 }, block.start);
        tl.fromTo(words, { yPercent: 100 }, { yPercent: 0, stagger: 0.003, duration: 0.05, ease: "power2.out" }, block.start);
        if (eyebrow) tl.fromTo(eyebrow, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.05 }, block.start);
        if (body) tl.fromTo(body, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.05 }, block.start);

        // Exit
        tl.to(el, { autoAlpha: 0, duration: 0.05 }, block.exit);
        tl.to(words, { yPercent: -100, stagger: 0.002, duration: 0.05, ease: "power2.in" }, block.exit);
        if (body) tl.to(body, { autoAlpha: 0, y: -10, duration: 0.05 }, block.exit);
      });

      // Final Copy Block (82% -> 100%)
      const finalEl = finalCopyRef.current;
      if (finalEl) {
        const finalWords = finalEl.querySelectorAll(".cinematic-about__word");
        tl.to(finalEl, { autoAlpha: 1, duration: 0.07 }, 0.82);
        tl.fromTo(finalWords, { yPercent: 100 }, { yPercent: 0, stagger: 0.005, duration: 0.07, ease: "power2.out" }, 0.82);
      }

      // Exit Zoom-In & Fade-Out (91% -> 100%)
      tl.to(
        video,
        { scale: 1.28, transformOrigin: "50% 30%", filter: "blur(3px)", autoAlpha: 0.22, duration: 0.09, ease: "power2.in" },
        0.91
      );

      // Darken overlay at the very end to match next section
      tl.to(
        ".cinematic-about__shade",
        { background: "rgba(0, 0, 0, 0.9)", duration: 0.08, ease: "power2.in" },
        0.92
      );

      return () => {
        tl.kill();
      };
    },
    {
      scope: sectionRef,
      dependencies: [videoDuration, compactViewport],
      revertOnUpdate: true,
    }
  );

  const renderSplitTitle = (title: string) => {
    return title.split(" ").map((word, i) => (
      <span key={i} className="inline-block overflow-hidden mr-[0.25em] py-[0.18em] -my-[0.18em]">
        <span className="inline-block cinematic-about__word will-change-transform">
          {word}
        </span>
      </span>
    ));
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="Sobre em experiencia cinematografica"
      className="cinematic-about"
    >
      <video
        ref={videoRef}
        src={shouldLoadVideo ? VIDEO_SRC : undefined}
        className="cinematic-about__video"
        muted
        playsInline
        preload="metadata"
        style={{ willChange: "transform" }}
        aria-hidden="true"
      />

      <div className="cinematic-about__shade" />
      <div className="cinematic-about__top-vignette" />
      <div className="cinematic-about__bottom-vignette" />

      {!isVideoLoaded && (
        <div className="cinematic-about__loader" aria-hidden="true">
          <div className="cinematic-about__loader-track">
            <div className="cinematic-about__loader-bar cinematic-about__loader-bar--indeterminate" />
          </div>
        </div>
      )}

      <div className="cinematic-about__copy-layer">
        {COPY_BLOCKS.map((copy, index) => (
          <div
            key={copy.id}
            ref={(node) => {
              copyRefs.current[index] = node;
            }}
            className={`cinematic-about__copy cinematic-about__copy--${copy.id}`}
          >
            <p className="cinematic-about__eyebrow">{copy.eyebrow}</p>
            <h2 className="cinematic-about__title flex flex-wrap leading-[1.05]">{renderSplitTitle(copy.title)}</h2>
            <p className="cinematic-about__body">{copy.body}</p>
          </div>
        ))}

        <div ref={finalCopyRef} className="cinematic-about__final-copy">
          <h2 className="cinematic-about__final-title leading-[1.15]">
            <span className="block overflow-hidden py-[0.18em] -my-[0.18em]">
              <span className="inline-block cinematic-about__word will-change-transform">
                Design limpo por fora,
              </span>
            </span>
            <span className="block overflow-hidden py-[0.18em] -my-[0.18em]">
              <span className="inline-block cinematic-about__word will-change-transform">
                engenharia e aprendizado
              </span>
            </span>
            <span className="block overflow-hidden py-[0.18em] -my-[0.18em]">
              <span className="inline-block cinematic-about__word will-change-transform">
                por dentro.
              </span>
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}
