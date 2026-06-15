import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  progress: number;
  isReady: boolean;
  onFadeComplete: () => void;
}

const DIAGNOSTICS = [
  { threshold: 5, text: "> Initializing QA Diagnostic Suite..." },
  { threshold: 20, text: "> Checking responsive viewport grids..." },
  { threshold: 35, text: "> Validating DOM node hierarchies... [OK]" },
  { threshold: 50, text: "> Loading project evidence images..." },
  { threshold: 65, text: "> Mapping GSAP ScrollTrigger timelines... [OK]" },
  { threshold: 80, text: "> Initializing WebGL fluid trail buffer..." },
  { threshold: 92, text: "> Starting Three.js 3D canvas mesh..." },
  { threshold: 100, text: "> Diagnostics complete. System ready." },
];

export default function LoadingScreen({ progress, isReady, onFadeComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  
  const progressVal = useRef(0);
  const fadeStarted = useRef(false);
  const printedLogs = useRef<Set<number>>(new Set());

  // Helper to trigger the exit timeline
  const triggerFade = useCallback(() => {
    if (fadeStarted.current) return;
    fadeStarted.current = true;
    
    const ctx = containerRef.current;
    if (!ctx) return;
    
    const tl = gsap.timeline({
      onComplete: onFadeComplete
    });

    // Stagger elements exit
    tl.to(titleRef.current, {
      opacity: 0,
      y: -20,
      filter: "blur(6px)",
      duration: 0.8,
      ease: "power2.in"
    }, 0);

    tl.to(counterRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.6,
      ease: "power2.in"
    }, 0.2);

    if (particlesContainerRef.current) {
      tl.to(particlesContainerRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: "power2.inOut"
      }, 0);
    }

    tl.to(ctx, {
      opacity: 0,
      duration: 1.2,
      ease: "power3.inOut"
    }, 0.4);
  }, [onFadeComplete]);

  // Interpolate display progress to match actual progress smoothly
  useEffect(() => {
    const obj = { val: progressVal.current };
    const tween = gsap.to(obj, {
      val: progress,
      duration: 0.4,
      ease: "power1.out",
      onUpdate: () => {
        progressVal.current = obj.val;
        const rounded = Math.round(obj.val);
        
        // Update DOM directly to avoid React re-renders
        if (counterRef.current) {
          const textEl = counterRef.current.querySelector(".progress-text");
          if (textEl) {
            textEl.textContent = `${String(rounded).padStart(3, "0")}%`;
          }
        }
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${rounded}%`;
        }

        // Print diagnostic logs directly to the DOM
        if (logsRef.current) {
          DIAGNOSTICS.forEach((diag, idx) => {
            if (rounded >= diag.threshold && !printedLogs.current.has(idx)) {
              printedLogs.current.add(idx);
              const logLine = document.createElement("div");
              logLine.className = "truncate opacity-80 text-white/50 leading-normal";
              logLine.textContent = diag.text;
              logsRef.current?.appendChild(logLine);
              
              // Scroll to bottom of log panel
              logsRef.current.scrollTop = logsRef.current.scrollHeight;
            }
          });
        }

        if (rounded >= 100 && isReady) {
          triggerFade();
        }
      }
    });
    return () => {
      tween.kill();
    };
  }, [progress, isReady, triggerFade]);

  // Title character reveal animation on mount
  useEffect(() => {
    const chars = titleRef.current?.querySelectorAll(".reveal-char");
    if (chars && chars.length > 0) {
      gsap.fromTo(chars, 
        { opacity: 0, y: 15, filter: "blur(4px)" }, 
        { 
          opacity: 1, 
          y: 0, 
          filter: "blur(0px)", 
          duration: 1.4, 
          stagger: 0.06, 
          ease: "power3.out",
          delay: 0.2
        }
      );
    }
  }, []);

  // Generate 35 background particles with pure CSS animations
  const particles = Array.from({ length: 35 }).map((_, i) => {
    const size = Math.random() * 2.5 + 0.8; // 0.8px to 3.3px
    const left = Math.random() * 100; // 0% to 100%
    const duration = Math.random() * 10 + 6; // 6s to 16s
    const delay = Math.random() * -16; // negative delay so they start immediately at different positions
    const opacity = Math.random() * 0.35 + 0.05;

    return (
      <div
        key={i}
        className="absolute bg-white rounded-full pointer-events-none animate-float-up"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          opacity: opacity,
          bottom: `-10px`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          "--particle-opacity": opacity,
          willChange: "transform, opacity",
        } as React.CSSProperties}
      />
    );
  });

  // Split name for staggered reveal
  const name = "GUSTAVO ALVES";
  const nameArray = name.split("").map((char, index) => {
    if (char === " ") {
      return (
        <span key={index} style={{ display: "inline-block", width: "0.25em" }}>
          &nbsp;
        </span>
      );
    }
    return (
      <span
        key={index}
        className="reveal-char inline-block"
        style={{ willChange: "transform, opacity, filter" }}
      >
        {char}
      </span>
    );
  });

  return (
    <div
      ref={containerRef}
      data-testid="portfolio-loader"
      className="fixed inset-0 w-full h-full z-[99999] flex flex-col justify-between items-center bg-[#050505] text-white overflow-hidden pointer-events-auto"
      style={{ willChange: "opacity" }}
    >
      {/* Background Particle Container */}
      <div ref={particlesContainerRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        {particles}
      </div>

      {/* Grid Layout overlay for Cyberpunk feeling */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Corner indicators for cyberpunk / HUD layout */}
      <div className="absolute top-8 left-8 text-[9px] font-mono tracking-[0.2em] text-white/20 select-none hidden sm:block">
        SYS.BOOT_SEQUENCE // V.2.0
      </div>
      <div className="absolute top-8 right-8 text-[9px] font-mono tracking-[0.2em] text-white/20 select-none hidden sm:block">
        QA_DIAGNOSTIC_SUITE
      </div>

      {/* Main Center Area: Name Reveal */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <h1
          ref={titleRef}
          className="font-serif text-[28px] sm:text-[40px] md:text-[52px] tracking-[0.3em] font-light leading-none select-none uppercase antialiased text-white"
        >
          {nameArray}
        </h1>
        
        {/* Progress Bar Container */}
        <div className="w-[180px] h-[1px] bg-white/10 mt-6 relative overflow-hidden">
          <div 
            ref={progressBarRef}
            className="absolute left-0 top-0 h-full bg-white transition-all duration-300"
            style={{ width: "0%" }}
          />
        </div>

        {/* Live Diagnostics Log Panel */}
        <div 
          ref={logsRef}
          className="h-[75px] w-[220px] sm:w-[260px] font-mono text-[9px] text-white/30 text-left mt-6 overflow-hidden space-y-0.5 select-none scroll-smooth"
        />
      </div>

      {/* Bottom Counter Area */}
      <div
        ref={counterRef}
        className="pb-12 md:pb-16 flex flex-col items-center justify-center space-y-2 relative z-10"
      >
        <span className="progress-text font-mono text-[14px] sm:text-[18px] tracking-[0.4em] font-light text-white/80">
          000%
        </span>
        <span className="font-sans text-[8px] tracking-[0.3em] text-white/30 uppercase font-medium">
          Iniciando diagnóstico do sistema...
        </span>
      </div>
    </div>
  );
}
