/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface NarrativeMoment {
  label: string;
  title: string;
  body: string;
}

interface VideoNarrativeSectionProps {
  id: string;
  variant: "impact" | "final";
  videoSrc: string;
  eyebrow: string;
  title: string;
  moments: NarrativeMoment[];
  ctas?: Array<{
    href: string;
    label: string;
  }>;
}

function getInitialReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getInitialCompactViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
}

export default function VideoNarrativeSection({
  id,
  variant,
  videoSrc,
  eyebrow,
  title,
  moments,
  ctas = [],
}: VideoNarrativeSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const momentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lineRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || reducedMotion || compactViewport) {
      video?.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { root: null, threshold: 0.12 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const video = videoRef.current;
      const media = mediaRef.current;
      const content = contentRef.current;
      const line = lineRef.current;
      const cta = ctaRef.current;
      const activeMoments = momentRefs.current.filter(Boolean);

      if (reducedMotion || compactViewport) {
        if (video) {
          video.pause();
          video.currentTime = variant === "impact" ? 2 : 5;
        }
        gsap.set(content, { autoAlpha: 1, y: 0, xPercent: 0, scale: 1, clearProps: "filter" });
        gsap.set(media, { autoAlpha: compactViewport ? 0 : 1, xPercent: 0, scale: 1, clearProps: "filter" });
        gsap.set(activeMoments, { autoAlpha: 1, y: 0, clearProps: "filter" });
        gsap.set(line, { scaleY: 1 });
        if (cta) gsap.set(cta, { autoAlpha: 1, y: 0 });
        return;
      }

      const scrollVh = variant === "impact" ? (compactViewport ? 145 : 172) : compactViewport ? 135 : 165;

      if (variant === "impact") {
        gsap.set(activeMoments, { autoAlpha: 0, y: 18, filter: "blur(6px)" });
        gsap.set(activeMoments[0], { autoAlpha: 1, y: 0, filter: "blur(0px)" });
        gsap.set(content, {
          autoAlpha: 1,
          xPercent: 0,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transformOrigin: compactViewport ? "50% 100%" : "100% 50%",
        });
        gsap.set(media, {
          autoAlpha: 1,
          xPercent: compactViewport ? 0 : -18,
          scale: compactViewport ? 1.08 : 0.96,
          filter: "blur(0px)",
          transformOrigin: "50% 50%",
        });
        gsap.set(video, { autoAlpha: 1, scale: compactViewport ? 1.18 : 0.88, transformOrigin: "50% 50%" });
      } else {
        gsap.set(activeMoments, { autoAlpha: 0, y: 18, filter: "blur(5px)" });
        gsap.set(activeMoments[0], { autoAlpha: 1, y: 0, filter: "blur(0px)" });
        gsap.set(content, { autoAlpha: 1, xPercent: 0, y: 0, scale: 1, filter: "blur(0px)" });
        gsap.set(media, { autoAlpha: 1, xPercent: 0, scale: 1, filter: "blur(0px)" });
        gsap.set(video, { autoAlpha: 1, scale: 1, transformOrigin: "50% 50%" });
      }

      gsap.set(line, { scaleY: 0, transformOrigin: "top center" });
      if (cta) gsap.set(cta, { autoAlpha: 0, y: 16 });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * (scrollVh / 100))}`,
          scrub: 0.45,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          refreshPriority: variant === "impact" ? 20 : 0,
          invalidateOnRefresh: true,
          onEnter: () => void video?.play().catch(() => {}),
          onEnterBack: () => void video?.play().catch(() => {}),
          onLeave: () => video?.pause(),
          onLeaveBack: () => video?.pause(),
        },
      });

      if (variant === "impact" && media) {
        timeline.to(media, { xPercent: 0, scale: compactViewport ? 1 : 1.02, duration: 0.5, ease: "power2.inOut" }, 0.1);
        if (content) {
          timeline.to(
            content,
            {
              xPercent: compactViewport ? 0 : 7,
              y: compactViewport ? 22 : 0,
              scale: compactViewport ? 0.92 : 0.82,
              filter: "blur(2.5px)",
              autoAlpha: 0.28,
              duration: 0.22,
              ease: "power2.inOut",
            },
            0.5
          );
          timeline.to(content, { autoAlpha: 0, duration: 0.11, ease: "power2.in" }, 0.68);
        }
        if (video) {
          timeline.to(video, { scale: compactViewport ? 1.3 : 1, duration: 0.38, ease: "power2.out" }, 0.42);
          timeline.to(video, { scale: compactViewport ? 1.44 : 1.16, filter: "blur(1px)", duration: 0.18, ease: "power2.inOut" }, 0.75);
          timeline.to(video, { autoAlpha: 0.08, filter: "blur(7px)", duration: 0.08, ease: "power2.in" }, 0.92);
        }
        timeline.to(media, { autoAlpha: 0.08, duration: 0.08, ease: "power2.in" }, 0.92);
      }

      timeline.to(line, { scaleY: 1, duration: variant === "impact" ? 0.62 : 0.92 }, 0.04);

      activeMoments.forEach((moment, index) => {
        const start = index === 0 ? 0 : index / activeMoments.length;
        const exit = Math.min(0.9, start + 1 / activeMoments.length - 0.06);

        if (variant === "impact") {
          if (index > 0) {
            timeline.to(moment, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.11, ease: "power2.out" }, start);
          }
          if (index < activeMoments.length - 1) {
            timeline.to(moment, { autoAlpha: 0, y: -14, filter: "blur(5px)", duration: 0.11, ease: "power2.in" }, exit);
          } else {
            timeline.to(moment, { autoAlpha: 0, y: -10, filter: "blur(5px)", duration: 0.1, ease: "power2.in" }, 0.62);
          }
          return;
        }

        if (index > 0) {
          timeline.to(moment, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.1, ease: "power2.out" }, start);
        }
        if (index < activeMoments.length - 1) {
          timeline.to(moment, { autoAlpha: 0, y: -12, filter: "blur(5px)", duration: 0.1, ease: "power2.in" }, exit);
        }
      });

      if (cta) {
        timeline.to(cta, { autoAlpha: 1, y: 0, duration: 0.12, ease: "power2.out" }, 0.82);
      }

      return () => {
        timeline.kill();
      };
    },
    { scope: sectionRef, dependencies: [compactViewport, reducedMotion, variant], revertOnUpdate: true }
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`video-narrative video-narrative--${variant} ${
        reducedMotion ? "video-narrative--reduced" : ""
      } ${compactViewport ? "video-narrative--mobile-lite" : ""}`}
      aria-label={eyebrow}
    >
      <div className="video-narrative__stage">
        <div ref={mediaRef} className="video-narrative__media">
          <video
            ref={videoRef}
            className="video-narrative__video"
            src={!compactViewport ? videoSrc : undefined}
            muted
            playsInline
            loop
            autoPlay={!reducedMotion && !compactViewport}
            preload={!compactViewport ? "metadata" : "none"}
            aria-hidden="true"
          />
        </div>
        <div className="video-narrative__shade" />
        <div className="video-narrative__grain" />

        <div ref={contentRef} className="video-narrative__content">
          <p className="video-narrative__eyebrow">{eyebrow}</p>
          <h2 className="video-narrative__title">{title}</h2>

          <div className="video-narrative__life">
            <span className="video-narrative__life-track" aria-hidden="true">
              <span ref={lineRef} />
            </span>
            <div className="video-narrative__moments">
              {moments.map((moment, index) => (
                <div
                  key={`${moment.label}-${moment.title}`}
                  ref={(node) => {
                    momentRefs.current[index] = node;
                  }}
                  className="video-narrative__moment"
                >
                  <span>{moment.label}</span>
                  <h3>{moment.title}</h3>
                  <p>{moment.body}</p>
                </div>
              ))}
            </div>
          </div>

          {ctas.length > 0 && (
            <div ref={ctaRef} className="video-narrative__ctas">
              {ctas.map((cta) => (
                <a key={cta.href} href={cta.href}>
                  {cta.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
