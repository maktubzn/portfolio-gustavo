/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_LETTERS = [
  { char: "G", speed: -120 },
  { char: "U", speed: 80 },
  { char: "S", speed: 180 },
  { char: "T", speed: -90 },
  { char: "A", speed: 220 },
  { char: "V", speed: 110 },
  { char: "O", speed: -160 },
];

export default function FooterSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scroller = container.closest(".custom-scrollbar") as HTMLElement | null;

    // Parallax individual letters on scroll
    letterRefs.current.forEach((letterEl, index) => {
      if (!letterEl) return;
      const speed = FOOTER_LETTERS[index].speed;

      gsap.fromTo(
        letterEl,
        { y: -speed },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            scroller,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <footer
      ref={containerRef}
      id="footer"
      className="h-[70vh] md:h-screen border-t border-white/5 relative z-10 bg-black flex flex-col justify-between items-center py-16 select-none overflow-hidden"
    >
      {/* Decorative top row info */}
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col gap-3 text-center md:flex-row md:justify-between md:text-left md:items-center text-[10px] tracking-[0.2em] text-white/30 uppercase font-sans">
        <span>© 2026 Gustavo dos Santos Alves</span>
        <span>Mairiporã/SP</span>
      </div>

      {/* Large exploding/aligning letters */}
      <div className="flex justify-center items-center font-serif text-[11vw] leading-none text-white tracking-widest">
        {FOOTER_LETTERS.map((item, index) => (
          <span
            key={index}
            ref={(el) => {
              letterRefs.current[index] = el;
            }}
            className="inline-block will-change-transform"
          >
            {item.char}
          </span>
        ))}
      </div>

      {/* Bottom row info */}
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] tracking-[0.16em] text-white/30 uppercase font-sans">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <a href="mailto:gustavoalvesmp.dev@gmail.com" className="break-all text-center hover:text-white transition-colors duration-300 no-underline md:text-left">
            gustavoalvesmp.dev@gmail.com
          </a>
          <a href="tel:+5511975656474" className="hover:text-white transition-colors duration-300 no-underline">
            (11) 97565-6474
          </a>
        </div>
        <div className="flex flex-col items-center gap-2 md:items-center">
          <a
            href="https://www.linkedin.com/in/gustavo-alves-7a81603a9"
            target="_blank"
            rel="noreferrer"
            className="break-all text-center hover:text-white transition-colors duration-300 no-underline"
          >
            linkedin.com/in/gustavo-alves-7a81603a9
          </a>
          <a
            href="https://github.com/maktubzn"
            target="_blank"
            rel="noreferrer"
            className="break-all text-center hover:text-white transition-colors duration-300 no-underline"
          >
            github.com/maktubzn
          </a>
        </div>
        <a href="#hero" className="hover:text-white transition-colors duration-300 no-underline">
          Voltar ao topo ↑
        </a>
      </div>
    </footer>
  );
}
