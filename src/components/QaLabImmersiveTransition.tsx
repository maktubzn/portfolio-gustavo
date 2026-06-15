/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileSearch, Gauge, TerminalSquare } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const DECORATIVE_SCREENS = [
  {
    src: "/qa-lab-screens/qa-lab-screen-01-test-dashboard.png",
    alt: "Dashboard visual de testes QA",
    className: "qa-immersive__panel--one",
  },
  {
    src: "/qa-lab-screens/qa-lab-screen-02-bug-tracker.png",
    alt: "Tela visual de bug tracker",
    className: "qa-immersive__panel--two",
  },
  {
    src: "/qa-lab-screens/qa-lab-screen-03-automation-logs.png",
    alt: "Tela visual de logs de automacao",
    className: "qa-immersive__panel--three",
  },
  {
    src: "/qa-lab-screens/qa-lab-screen-04-mobile-testing.png",
    alt: "Tela visual de testes mobile",
    className: "qa-immersive__panel--four",
  },
  {
    src: "/qa-lab-screens/qa-lab-screen-05-accessibility-report.png",
    alt: "Tela visual de relatorio de acessibilidade",
    className: "qa-immersive__panel--five",
  },
  {
    src: "/qa-lab-screens/qa-lab-screen-06-error-monitoring.png",
    alt: "Tela visual de monitoramento de erros",
    className: "qa-immersive__panel--six",
  },
];

const QA_CARDS = [
  {
    icon: CheckCircle2,
    tag: "Teste",
    title: "Fluxos validados",
    body: "Caminhos reais testados antes de chamar algo de pronto.",
  },
  {
    icon: FileSearch,
    tag: "Evidencia",
    title: "Bugs com contexto",
    body: "Registro claro do que falhou, onde falhou e como reproduzir.",
  },
  {
    icon: TerminalSquare,
    tag: "Automacao",
    title: "Regressao guiada",
    body: "Scripts e checks para repetir validacoes sem depender de memoria.",
  },
  {
    icon: Gauge,
    tag: "Qualidade",
    title: "Visual sob controle",
    body: "Responsividade, estados e detalhes revisados como experiencia real.",
  },
];

function getInitialReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getInitialCompactViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
}

export default function QaLabImmersiveTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(getInitialReducedMotion);
  const [compactViewport, setCompactViewport] = useState(getInitialCompactViewport);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const updateMotion = () => setReducedMotion(motionQuery.matches);
    const updateCompact = () => setCompactViewport(compactQuery.matches);

    updateMotion();
    updateCompact();
    motionQuery.addEventListener("change", updateMotion);
    compactQuery.addEventListener("change", updateCompact);

    return () => {
      motionQuery.removeEventListener("change", updateMotion);
      compactQuery.removeEventListener("change", updateCompact);
    };
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const q = gsap.utils.selector(section);
      const panels = q(".qa-immersive__panel");
      const portal = q(".qa-immersive__portal");
      const portalDetails = q(".qa-immersive__portal-detail");
      const bento = q(".qa-immersive__bento");
      const lightWash = q(".qa-immersive__light-wash");
      const intro = q(".qa-immersive__intro");
      const finalHeader = q(".qa-immersive__final-header");
      const finalCards = q(".qa-immersive__card");

      if (reducedMotion) {
        gsap.set(lightWash, { autoAlpha: 1 });
        gsap.set(intro, { autoAlpha: 0 });
        gsap.set(bento, { autoAlpha: 0 });
        gsap.set(finalHeader, { autoAlpha: 1, y: 0 });
        gsap.set(finalCards, { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" });
        return;
      }

      gsap.set(panels, { autoAlpha: 0, y: 34, scale: 0.94, filter: "blur(8px)" });
      gsap.set(portal, { autoAlpha: 0, y: 26, scale: compactViewport ? 0.72 : 0.78, filter: "blur(5px)" });
      gsap.set(intro, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      gsap.set(lightWash, { autoAlpha: 0 });
      gsap.set(finalHeader, { autoAlpha: 0, y: 30, filter: "blur(8px)" });
      gsap.set(finalCards, {
        autoAlpha: 0,
        x: (index: number) => (index % 2 === 0 ? -160 : 160),
        y: (index: number) => (index < 2 ? -140 : 140),
        scale: 0.84,
        filter: "blur(10px)",
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * (compactViewport ? 2.15 : 2.65))}`,
          scrub: 0.7,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          refreshPriority: 12,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(panels, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.2, stagger: 0.025, ease: "power2.out" }, 0)
        .to(portal, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.24, ease: "power2.out" }, 0.04)
        .to(intro, { autoAlpha: 0, y: -18, filter: "blur(7px)", duration: 0.16, ease: "power2.in" }, 0.18)
        .to(panels, {
          x: (index: number) => (index % 2 === 0 ? -70 : 70),
          y: (index: number) => (index < 3 ? -52 : 52),
          scale: 0.9,
          autoAlpha: 0.46,
          filter: "blur(2px)",
          duration: 0.26,
          ease: "power2.inOut",
        }, 0.26)
        .to(portal, {
          scale: compactViewport ? 1.82 : 2.35,
          y: compactViewport ? -8 : -18,
          borderRadius: compactViewport ? "2rem" : "2.7rem",
          duration: 0.28,
          ease: "power2.inOut",
        }, 0.3)
        .to(lightWash, { autoAlpha: 1, duration: 0.26, ease: "power2.inOut" }, 0.42)
        .to(portalDetails, { autoAlpha: 0, y: -16, filter: "blur(10px)", duration: 0.18, ease: "power2.in" }, 0.48)
        .to(bento, { autoAlpha: 0.18, scale: compactViewport ? 1.18 : 1.34, filter: "blur(8px)", duration: 0.24, ease: "power2.inOut" }, 0.56)
        .to(portal, { autoAlpha: 0, scale: compactViewport ? 2.25 : 3.15, duration: 0.18, ease: "power2.in" }, 0.64)
        .to(finalHeader, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.18, ease: "power2.out" }, 0.66)
        .to(finalCards, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.24,
          stagger: 0.035,
          ease: "power3.out",
        }, 0.72);

      return () => {
        timeline.kill();
      };
    },
    { scope: sectionRef, dependencies: [compactViewport, reducedMotion], revertOnUpdate: true }
  );

  return (
    <section ref={sectionRef} id="benefits" className="qa-immersive" aria-label="QA Lab">
      <div className="qa-immersive__stage">
        <div className="qa-immersive__light-wash" aria-hidden="true" />

        <div className="qa-immersive__intro" aria-hidden="true">
          <span>QA Lab</span>
          <p>Telas, evidencias e testes virando uma area limpa.</p>
        </div>

        <div className="qa-immersive__bento" aria-hidden="true">
          {DECORATIVE_SCREENS.map((screen) => (
            <div key={screen.src} className={`qa-immersive__panel ${screen.className}`}>
              <img src={screen.src} alt={screen.alt} draggable={false} />
            </div>
          ))}

          <div className="qa-immersive__portal">
            <div className="qa-immersive__portal-topbar">
              <span />
              <span />
              <span />
              <strong>QA LAB / LIVE BOARD</strong>
            </div>
            <div className="qa-immersive__portal-detail qa-immersive__portal-hero">
              <span>Suite status</span>
              <strong>87%</strong>
              <p>Fluxos principais em validacao</p>
            </div>
            <div className="qa-immersive__portal-detail qa-immersive__portal-grid">
              <div>
                <span>Manual</span>
                <strong>12</strong>
              </div>
              <div>
                <span>Bugs</span>
                <strong>04</strong>
              </div>
              <div>
                <span>E2E</span>
                <strong>08</strong>
              </div>
            </div>
            <div className="qa-immersive__portal-detail qa-immersive__portal-log">
              <span>POST /checkout</span>
              <span>UI responsive check</span>
              <span>Evidence attached</span>
            </div>
          </div>
        </div>

        <div className="qa-immersive__final">
          <div className="qa-immersive__final-header">
            <span>Habilidades / Skills</span>
            <h2>
              QA <em>Lab</em>
            </h2>
            <p>
              Um espaco para mostrar como eu testo, observo falhas e transformo aprendizado em evidencias claras.
            </p>
          </div>

          <div className="qa-immersive__cards">
            {QA_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="qa-immersive__card">
                  <div>
                    <span>{card.tag}</span>
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
