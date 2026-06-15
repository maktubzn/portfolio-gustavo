/**
 * ProjectPresentationView
 *
 * Case study vertical dos projetos. Mantem o visual escuro do portfolio, mas evita
 * ScrollTrigger dentro do modal para nao competir com Lenis e com o scroll nativo.
 */

import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { X, Layers, ShieldCheck, Cpu, Code, CheckCircle, Maximize2 } from "lucide-react";
import NumberTicker from "./ui/NumberTicker";
import MediaLightbox, { type MediaLightboxItem } from "./MediaLightbox";
import { CardData, CardViewportRect } from "../types";

interface ProjectPresentationViewProps {
  card: CardData;
  originRect: CardViewportRect;
  onCloseRequest: () => void;
}

const PROJECT_ACCENTS: Record<number, string> = {
  1: "#f97316",
  2: "#ec4899",
  3: "#38bdf8",
  4: "#34d399",
  5: "#f43f5e",
};

const PROJECT_ACCENT_NAMES: Record<number, string> = {
  1: "GS orange",
  2: "arcade pink",
  3: "mechanic blue",
  4: "QA teal",
  5: "glow coral",
};

function ProjectBackgroundCanvas({ projectId }: { projectId: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let width = canvas.width = canvas.clientWidth || window.innerWidth;
    let height = canvas.height = canvas.clientHeight || window.innerHeight;

    const handleResize = () => {
      width = canvas.width = canvas.clientWidth || window.innerWidth;
      height = canvas.height = canvas.clientHeight || window.innerHeight;
    };

    const particles = Array.from({ length: projectId === 2 ? 36 : 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.fillStyle = "rgba(6, 6, 8, 0.18)";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.38)";

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex++) {
          const next = particles[nextIndex];
          const distance = Math.hypot(particle.x - next.x, particle.y - next.y);
          if (distance < 145) {
            ctx.globalAlpha = (1 - distance / 145) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", handleResize);
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [projectId]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-35" aria-hidden="true" />;
}

const PROJECT_SCREENSHOTS: Record<number, string[]> = {
  1: [
    "/assets/projects/gs-shopping/01-home-desktop.png",
    "/assets/projects/gs-shopping/02-products-desktop.png",
    "/assets/projects/gs-shopping/03-product-detail-desktop.png",
    "/assets/projects/gs-shopping/05-admin-dashboard-desktop.png",
    "/assets/projects/gs-shopping/09-home-mobile.png",
  ],
  2: [
    "/assets/projects/jogo-react-arduino/01.png",
    "/assets/projects/jogo-react-arduino/02.png",
    "/assets/projects/jogo-react-arduino/live-game-court.png",
    "/assets/projects/jogo-react-arduino/live-game-admin.png",
    "/assets/projects/jogo-react-arduino/mesa-tribunal.png",
  ],
  3: [
    "/assets/projects/gestmecanic/04_in_cio_da_oficina.png",
    "/assets/projects/gestmecanic/05_novo_atendimento_em_etapas.png",
    "/assets/projects/gestmecanic/06_selecionar_ou_criar_cliente.png",
    "/assets/projects/gestmecanic/10_diagn_stico_t_cnico.png",
    "/assets/projects/gestmecanic/12_or_amento.png",
  ],
  4: [
    "/assets/projects/qa-lab/card.webp",
    "/assets/projects/gs-shopping/live-home-desktop.png",
    "/assets/projects/glowagend/live-admin-panel.png",
    "/assets/projects/jogo-react-arduino/live-game-admin.png",
  ],
  5: [
    "/assets/projects/glowagend/overview-light.png",
    "/assets/projects/glowagend/agenda-calendar-light.png",
    "/assets/projects/glowagend/live-admin-panel.png",
    "/assets/projects/glowagend/vendas-light.png",
    "/assets/projects/glowagend/config-dark.png",
  ],
};

interface ShowcaseData {
  hasDesktop: boolean;
  desktopSrc?: string;
  hasMobile: boolean;
  mobileSrc?: string;
  hasAdmin: boolean;
  adminSrc?: string;
  adminTitle?: string;
}

const SHOWCASE_RESOURCES: Record<number, ShowcaseData> = {
  1: {
    hasDesktop: true,
    desktopSrc: "/assets/projects/gs-shopping/live-home-desktop.png",
    hasMobile: true,
    mobileSrc: "/assets/projects/gs-shopping/09-home-mobile.png",
    hasAdmin: true,
    adminSrc: "/assets/projects/gs-shopping/live-admin-dashboard-desktop.png",
    adminTitle: "Painel admin do lojista",
  },
  2: {
    hasDesktop: true,
    desktopSrc: "/assets/projects/jogo-react-arduino/live-game-court.png",
    hasMobile: false,
    hasAdmin: true,
    adminSrc: "/assets/projects/jogo-react-arduino/live-game-admin.png",
    adminTitle: "Painel operacional do apresentador",
  },
  3: {
    hasDesktop: true,
    desktopSrc: "/assets/projects/gestmecanic/card.webp",
    hasMobile: true,
    mobileSrc: "/assets/projects/gestmecanic/01_abertura_e_ativa_o.png",
    hasAdmin: false,
  },
  4: {
    hasDesktop: true,
    desktopSrc: "/assets/projects/qa-lab/card.webp",
    hasMobile: false,
    hasAdmin: false,
  },
  5: {
    hasDesktop: true,
    desktopSrc: "/assets/projects/glowagend/overview-light.png",
    hasMobile: true,
    mobileSrc: "/assets/projects/glowagend/clientes-light.png",
    hasAdmin: true,
    adminSrc: "/assets/projects/glowagend/live-admin-panel.png",
    adminTitle: "Gestao de agenda de profissionais",
  },
};

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const PROJECT_STATS: Record<number, StatItem[]> = {
  1: [
    { label: "Linhas de codigo", value: 18400, icon: Code },
    { label: "Queries de banco", value: 42, icon: Layers },
    { label: "Cobertura de testes", value: 95, suffix: "%", icon: CheckCircle },
  ],
  2: [
    { label: "Linhas de codigo", value: 6800, icon: Code },
    { label: "Conexoes Arduino", value: 12, icon: Cpu },
    { label: "Taxa de execucao", value: 100, suffix: "%", icon: CheckCircle },
  ],
  3: [
    { label: "Linhas de codigo", value: 14500, icon: Code },
    { label: "Tabelas locais SQLite", value: 8, icon: Layers },
    { label: "Consultas de IA", value: 150, icon: Cpu },
  ],
  4: [
    { label: "Casos de teste", value: 48, icon: CheckCircle },
    { label: "Relatorios de bugs", value: 15, icon: ShieldCheck },
    { label: "Assertivas de QA", value: 120, icon: Layers },
  ],
  5: [
    { label: "Linhas de codigo", value: 16200, icon: Code },
    { label: "Outbox workers", value: 3, icon: Cpu },
    { label: "Politicas RLS", value: 14, icon: ShieldCheck },
  ],
};

function findPhase(card: CardData, pattern: RegExp) {
  return card.story.find((step) => pattern.test(`${step.phase} ${step.title}`));
}

function EvidenceImage({
  src,
  title,
  index,
  onOpen,
}: {
  key?: string;
  src: string;
  title: string;
  index: number;
  onOpen: () => void;
}) {
  return (
    <figure className="group overflow-hidden rounded-xl border border-white/[0.07] bg-[#0c0c0e]">
      <div className="aspect-[16/10] overflow-hidden bg-black">
        <button
          type="button"
          onClick={onOpen}
          className="relative h-full w-full cursor-zoom-in overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label={`Ampliar evidencia ${index + 1} de ${title}`}
        >
          <img
            src={src}
            alt={`${title} evidencia ${index + 1}`}
            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
            loading="lazy"
          />
          <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/60 text-white/75 backdrop-blur transition group-hover:bg-white group-hover:text-black">
            <Maximize2 size={14} />
          </span>
        </button>
      </div>
      <figcaption className="border-t border-white/[0.06] px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white/35">
        Evidencia {String(index + 1).padStart(2, "0")}
      </figcaption>
    </figure>
  );
}

export default function ProjectPresentationView({
  card,
  originRect,
  onCloseRequest,
}: ProjectPresentationViewProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const tunnelVideoRef = useRef<HTMLVideoElement>(null);
  const screenshots = PROJECT_SCREENSHOTS[card.id] || [];
  const showcase = SHOWCASE_RESOURCES[card.id];
  const stats = PROJECT_STATS[card.id] || [];
  const accentColor = PROJECT_ACCENTS[card.id] || "#ffffff";
  const accentName = PROJECT_ACCENT_NAMES[card.id] || "project accent";
  const [introComplete, setIntroComplete] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const limitation = useMemo(() => findPhase(card, /LIMITA/i), [card]);
  const nextStep = useMemo(() => findPhase(card, /PROX/i), [card]);
  const heroImage = showcase?.desktopSrc || card.imageUrl;
  const originCenterX = originRect.left + originRect.width / 2;
  const originCenterY = originRect.top + originRect.height / 2;
  const introStyle = {
    "--origin-left": `${originRect.left}px`,
    "--origin-top": `${originRect.top}px`,
    "--origin-width": `${originRect.width}px`,
    "--origin-height": `${originRect.height}px`,
    "--origin-center-x": `${originCenterX}px`,
    "--origin-center-y": `${originCenterY}px`,
    "--project-accent": accentColor,
  } as CSSProperties;

  const mediaItems = useMemo<MediaLightboxItem[]>(() => {
    const items: MediaLightboxItem[] = [];

    if (showcase?.desktopSrc) {
      items.push({
        src: showcase.desktopSrc,
        title: `${card.projectName} - desktop`,
        caption: "Tela principal em contexto de uso.",
      });
    }
    if (showcase?.mobileSrc) {
      items.push({
        src: showcase.mobileSrc,
        title: `${card.projectName} - mobile`,
        caption: "Versao mobile usada para validar responsividade e fluxo.",
      });
    }
    if (showcase?.adminSrc) {
      items.push({
        src: showcase.adminSrc,
        title: showcase.adminTitle || `${card.projectName} - painel`,
        caption: "Painel complementar do projeto.",
      });
    }

    screenshots.forEach((src, index) => {
      if (items.some((item) => item.src === src)) return;
      items.push({
        src,
        title: `${card.projectName} - evidencia ${String(index + 1).padStart(2, "0")}`,
        caption: "Print usado para sustentar a narrativa do case study.",
      });
    });

    return items;
  }, [card.projectName, screenshots, showcase]);

  const openMediaBySrc = (src?: string) => {
    if (!src) return;
    const nextIndex = mediaItems.findIndex((item) => item.src === src);
    if (nextIndex >= 0) setLightboxIndex(nextIndex);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalRef.current?.scrollTo({ top: 0 });
    if (introComplete) closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && lightboxIndex === null) onCloseRequest();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [introComplete, lightboxIndex, onCloseRequest]);

  useEffect(() => {
    const intro = introRef.current;
    if (!intro) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setIntroComplete(true);
      return;
    }

    const video = tunnelVideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.load();
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(intro);
      const portal = q(".project-entry__portal");
      const layers = q(".project-entry__layer");
      const tunnel = q(".project-entry__tunnel");
      const title = q(".project-entry__title");
      const blackout = q(".project-entry__blackout");

      gsap.set(portal, {
        left: originRect.left,
        top: originRect.top,
        width: originRect.width,
        height: originRect.height,
        transformOrigin: "50% 50%",
      });
      gsap.set(layers, { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, opacity: 1, filter: "blur(0px)" });
      gsap.set(tunnel, {
        autoAlpha: 0,
        scale: 1,
        filter: "blur(0px) brightness(1.06) contrast(1.12) saturate(1.12)",
        transformOrigin: "50% 50%",
      });
      gsap.set(title, { autoAlpha: 0, y: 28, filter: "blur(10px)" });
      gsap.set(blackout, { autoAlpha: 0 });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          setIntroComplete(true);
          requestAnimationFrame(() => closeButtonRef.current?.focus());
        },
      });

      timeline
        .to(portal, {
          left: "50vw",
          top: "50vh",
          xPercent: -50,
          yPercent: -50,
          width: "min(74vw, 980px)",
          height: "min(58vh, 560px)",
          borderRadius: 32,
          duration: 0.9,
          ease: "expo.out",
        })
        .to(portal, {
          scale: 1.035,
          duration: 0.34,
          ease: "sine.inOut",
        })
        .to(layers, {
          x: (index: number) => [0, -110, 112, -72, 74, 0][index] ?? 0,
          y: (index: number) => [0, 58, -58, -92, 86, 0][index] ?? 0,
          z: (index: number) => [0, 100, 150, 190, 220, 260][index] ?? 0,
          rotateX: (index: number) => [0, 12, -10, 14, -12, 0][index] ?? 0,
          rotateY: (index: number) => [0, -15, 14, -10, 11, 0][index] ?? 0,
          scale: (index: number) => (index === 0 ? 1.08 : 0.96),
          opacity: (index: number) => (index === 0 ? 0.92 : 0.82),
          duration: 0.92,
          stagger: 0.055,
          ease: "power3.out",
        }, "-=0.04")
        .add("collapse", "-=0.2")
        .to(layers, {
          x: 0,
          y: 0,
          z: -360,
          rotateX: 0,
          rotateY: 0,
          scale: 0.42,
          opacity: 0,
          filter: "blur(18px)",
          duration: 0.88,
          stagger: 0.035,
          ease: "power3.in",
        }, "collapse")
        .to(portal, {
          scale: 0.28,
          opacity: 0,
          filter: "blur(18px)",
          duration: 0.78,
          ease: "power3.in",
        }, "collapse")
        .to(tunnel, {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px) brightness(1.06) contrast(1.12) saturate(1.12)",
          duration: 0.12,
          ease: "power2.out",
        }, "collapse+=0.48")
        .call(() => {
          if (!video) return;
          video.pause();
          video.currentTime = 0;
          void video.play().catch(() => {});
        }, undefined, "collapse+=0.5")
        .to(tunnel, {
          scale: 3.65,
          filter: "brightness(1.02) contrast(1.2) saturate(1.16)",
          duration: 5.4,
          ease: "none",
        }, "collapse+=0.5")
        .to(blackout, { autoAlpha: 1, duration: 1.05, ease: "power2.in" }, "-=1.05")
        .to(title, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.72, ease: "power3.out" }, "-=0.08")
        .to(title, { autoAlpha: 1, duration: 0.72 })
        .to(title, { autoAlpha: 0, y: -20, filter: "blur(8px)", duration: 0.42, ease: "power2.in" });
    }, intro);

    return () => ctx.revert();
  }, [accentColor, card.projectName, originRect.height, originRect.left, originRect.top, originRect.width]);

  useEffect(() => {
    if (!introComplete || !modalRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const rebuildItems = gsap.utils.toArray<HTMLElement>(".project-case-rebuild", modalRef.current);
      if (rebuildItems.length === 0) return;

      gsap.fromTo(
        rebuildItems,
        {
          autoAlpha: 0,
          y: 28,
          scale: 0.985,
          filter: "blur(8px)",
          transformOrigin: "50% 42%",
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.82,
          ease: "power3.out",
          stagger: 0.06,
        },
      );
    }, modalRef);

    return () => ctx.revert();
  }, [introComplete]);

  return (
    <motion.div
      ref={modalRef}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={`Case study de ${card.projectName}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(6px)" }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#060608] text-white outline-none scrollbar-thin"
      style={{ "--project-accent": accentColor } as CSSProperties}
    >
      {!introComplete && (
        <div ref={introRef} className="project-entry" style={introStyle} aria-hidden="true">
          <div className="project-entry__ambient" />
          <video
            ref={tunnelVideoRef}
            className="project-entry__tunnel"
            muted
            playsInline
            preload="auto"
            poster="/assets/videos/project-tunnel-poster.jpg"
            src="/assets/videos/project-tunnel-transition.mp4"
          />
          <div className="project-entry__portal">
            <div className="project-entry__layer project-entry__layer--back" />
            <div className="project-entry__layer project-entry__layer--image">
              <img src={heroImage} alt="" draggable={false} />
            </div>
            <div className="project-entry__layer project-entry__layer--blueprint">
              <span />
              <span />
              <span />
            </div>
            <div className="project-entry__layer project-entry__layer--top">
              <span>{card.category}</span>
              <strong>{card.projectName}</strong>
            </div>
            <div className="project-entry__layer project-entry__layer--chip project-entry__layer--chip-a">
              {accentName}
            </div>
            <div className="project-entry__layer project-entry__layer--chip project-entry__layer--chip-b">
              case study
            </div>
          </div>
          <div className="project-entry__blackout" />
          <div className="project-entry__title">
            <span>{card.category}</span>
            <h2>{card.projectName}</h2>
          </div>
        </div>
      )}

      <button
        ref={closeButtonRef}
        type="button"
        onClick={onCloseRequest}
        className={`fixed right-5 top-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-black/70 text-white/80 backdrop-blur transition hover:scale-105 hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
          introComplete ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label={`Fechar case study de ${card.projectName}`}
      >
        <X size={20} />
      </button>

      <section className="project-case-rebuild project-case-hero relative min-h-[86vh] overflow-hidden border-b border-white/[0.06] px-6 pb-16 pt-28 md:px-12 md:pb-20 md:pt-36">
        <ProjectBackgroundCanvas projectId={card.id} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_28%,rgba(255,255,255,0.12),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.35),#060608_88%)]" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        />

        <div className="relative mx-auto flex min-h-[62vh] w-full max-w-6xl flex-col justify-end">
          <span
            className="mb-5 inline-flex w-fit rounded-full border bg-black/45 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65 backdrop-blur"
            style={{ borderColor: `${accentColor}66` }}
          >
            {card.category}
          </span>
          <h1 className="max-w-4xl font-serif text-5xl font-light uppercase leading-[0.95] tracking-wide text-white md:text-8xl">
            {card.projectName}
          </h1>
          <p className="mt-7 max-w-2xl text-base font-light leading-relaxed text-white/62 md:text-lg">
            {card.story[0]?.text}
          </p>
        </div>
      </section>

      <main className="project-case-rebuild mx-auto w-full max-w-6xl px-6 py-16 md:px-12 md:py-24">
        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-6 md:col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Resumo honesto</span>
            <h2 className="mt-3 font-serif text-3xl font-light uppercase tracking-wide md:text-4xl">
              O que este projeto prova
            </h2>
            <p className="mt-5 text-sm font-light leading-relaxed text-white/58">
              {card.story[1]?.text || card.story[0]?.text}
            </p>
          </article>

          <aside className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Estado real</span>
            <p className="mt-4 text-sm font-light leading-relaxed text-white/58">
              {limitation?.text || "Projeto usado como estudo e demonstracao tecnica, sem prometer producao publica."}
            </p>
          </aside>
        </section>

        <section className="mt-20" aria-label="Linha do tempo do projeto">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                Processo
              </span>
              <h2 className="mt-3 font-serif text-4xl font-light uppercase tracking-wide md:text-6xl">
                Historia do projeto
              </h2>
            </div>
            <p className="max-w-md text-sm font-light leading-relaxed text-white/45">
              Etapas em leitura vertical para evitar travamento, corte de conteudo e texto acumulado.
            </p>
          </div>

          <div className="relative space-y-5 before:absolute before:left-[17px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-white/10 md:before:left-[23px]">
            {card.story.map((step, index) => {
              const image = step.imageUrl || (index === 0 ? card.imageUrl : undefined);
              return (
                <article key={`${step.phase}-${step.title}`} className="relative grid gap-5 pl-12 md:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] md:gap-8 md:pl-16">
                  <span
                    className="absolute left-0 top-1 grid h-9 w-9 place-items-center rounded-full border bg-[#060608] text-[10px] font-bold md:h-12 md:w-12"
                    style={{ borderColor: `${accentColor}66`, color: accentColor }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="rounded-xl border border-white/[0.07] bg-[#0b0b0e] p-6">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accentColor }}>
                      {step.phase}
                    </span>
                    <h3 className="mt-3 font-serif text-2xl font-light uppercase leading-tight tracking-wide text-white md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm font-light leading-relaxed text-white/58">
                      {step.text}
                    </p>
                  </div>

                  {image && (
                    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black">
                      <img src={image} alt={step.title} className="h-full max-h-[330px] w-full object-cover" loading="lazy" />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {showcase && (
          <section className="mt-24 border-t border-white/[0.06] pt-16" aria-label="Mockups e telas">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Mockups e telas</span>
            <h2 className="mt-3 font-serif text-4xl font-light uppercase tracking-wide md:text-6xl">
              Como aparece em uso
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-12 md:items-center">
              {showcase.hasDesktop && (
                <figure className={`${showcase.hasMobile ? "md:col-span-8" : "md:col-span-12"} overflow-hidden rounded-xl border border-white/[0.08] bg-black p-2`}>
                  <button
                    type="button"
                    onClick={() => openMediaBySrc(showcase.desktopSrc)}
                    className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    aria-label={`Ampliar tela desktop de ${card.projectName}`}
                  >
                    <img src={showcase.desktopSrc} alt={`${card.projectName} desktop`} className="aspect-video w-full rounded-lg object-cover transition duration-500 group-hover:scale-[1.015]" loading="lazy" />
                    <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/60 text-white/75 backdrop-blur transition group-hover:bg-white group-hover:text-black">
                      <Maximize2 size={15} />
                    </span>
                  </button>
                </figure>
              )}
              {showcase.hasMobile && (
                <figure className="mx-auto w-[230px] rounded-[32px] border-[4px] border-white/10 bg-black p-2 md:col-span-4">
                  <button
                    type="button"
                    onClick={() => openMediaBySrc(showcase.mobileSrc)}
                    className="group relative block aspect-[9/19] w-full cursor-zoom-in overflow-hidden rounded-[25px] border border-black bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    aria-label={`Ampliar tela mobile de ${card.projectName}`}
                  >
                    <img src={showcase.mobileSrc} alt={`${card.projectName} mobile`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" loading="lazy" />
                    <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/60 text-white/75 backdrop-blur transition group-hover:bg-white group-hover:text-black">
                      <Maximize2 size={14} />
                    </span>
                  </button>
                </figure>
              )}
            </div>

            {showcase.hasAdmin && (
              <figure className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-black p-2">
                <figcaption className="px-2 pb-3 pt-1 text-sm font-light uppercase tracking-[0.18em] text-white/45">
                  {showcase.adminTitle}
                </figcaption>
                <button
                  type="button"
                  onClick={() => openMediaBySrc(showcase.adminSrc)}
                  className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label={`Ampliar painel administrativo de ${card.projectName}`}
                >
                  <img src={showcase.adminSrc} alt={`${card.projectName} painel administrativo`} className="aspect-video w-full rounded-lg object-cover transition duration-500 group-hover:scale-[1.015]" loading="lazy" />
                  <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/60 text-white/75 backdrop-blur transition group-hover:bg-white group-hover:text-black">
                    <Maximize2 size={15} />
                  </span>
                </button>
              </figure>
            )}
          </section>
        )}

        {screenshots.length > 0 && (
          <section className="mt-24 border-t border-white/[0.06] pt-16" aria-label="Evidencias do projeto">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Evidencias</span>
            <h2 className="mt-3 font-serif text-4xl font-light uppercase tracking-wide md:text-6xl">
              Prints que sustentam a historia
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {screenshots.map((src, index) => (
                <EvidenceImage
                  key={`${src}-${index}`}
                  src={src}
                  title={card.projectName}
                  index={index}
                  onOpen={() => openMediaBySrc(src)}
                />
              ))}
            </div>
          </section>
        )}

        {stats.length > 0 && (
          <section className="mt-24 border-t border-white/[0.06] pt-16" aria-label="Indicadores do projeto">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Indicadores</span>
            <h2 className="mt-3 font-serif text-4xl font-light uppercase tracking-wide md:text-6xl">
              Fatos e escala
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-white/45">
              Numeros usados como contexto de estudo e manutencao do projeto. Em entrevista, devem ser explicados junto das evidencias reais.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <article key={stat.label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-6 text-center">
                    <Icon size={24} className="mx-auto text-white/42" />
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{stat.label}</p>
                    <h3 className="mt-3 font-mono text-4xl font-bold text-white">
                      <NumberTicker value={stat.value} />
                      {stat.suffix}
                    </h3>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-24 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8 md:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Proximo passo</span>
              <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/58">
                {nextStep?.text || "Organizar evidencias, documentar bugs reais e manter o projeto explicavel para uma conversa tecnica."}
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseRequest}
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Voltar ao portfolio
            </button>
          </div>
        </section>
      </main>

      {lightboxIndex !== null && mediaItems[lightboxIndex] && (
        <MediaLightbox
          items={mediaItems}
          currentIndex={lightboxIndex}
          accentColor={accentColor}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </motion.div>
  );
}
