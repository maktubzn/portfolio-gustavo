/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Terminal, HelpCircle, HardDrive } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";

const SKILLS = [
  {
    icon: CheckCircle2,
    num: "01",
    title: "Testes Manuais",
    proficiency: 90,
    description: "Validação funcional, escrita de casos de teste detalhados, report de bugs estruturados e testes exploratórios.",
    tools: ["DevTools", "Postman", "Heurísticas"],
  },
  {
    icon: Terminal,
    num: "02",
    title: "Automação E2E",
    proficiency: 75,
    description: "Escrita de testes funcionais ponta a ponta estruturados em JavaScript e TypeScript para validar fluxos web.",
    tools: ["Playwright", "Cypress", "JavaScript"],
  },
  {
    icon: HelpCircle,
    num: "03",
    title: "Validação de UI/UX",
    proficiency: 85,
    description: "Inspeção visual meticulosa, testes de responsividade em múltiplos viewports e verificação de integridade de design.",
    tools: ["Figma Inspect", "Lighthouse", "Mobile Debug"],
  },
  {
    icon: HardDrive,
    num: "04",
    title: "Versionamento & Specs",
    proficiency: 80,
    description: "Controle de versão colaborativo, escrita técnica de especificações de teste em Markdown e documentação clara.",
    tools: ["Git/GitHub", "Markdown", "Jira boards"],
  },
];



interface SkillItem {
  icon: any;
  num: string;
  title: string;
  proficiency: number;
  description: string;
  tools: string[];
}

interface SkillCardProps {
  skill: SkillItem;
  key?: any;
}

function SkillCard({ skill }: SkillCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const Icon = skill.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card center (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Multiply to get degrees (limit tilt to max 12deg)
    const rotateX = -mouseY * 16;
    const rotateY = mouseX * 16;

    setCoords({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale(${isHovered ? 1.02 : 1})`,
        transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease, background-color 0.5s ease",
        transformStyle: "preserve-3d",
      }}
      className="relative flex flex-col justify-between border border-white/[0.06] bg-[#09090b]/80 rounded-2xl p-6 shadow-[0_15px_30px_rgba(0,0,0,0.6)] h-[290px] md:h-[310px] overflow-hidden select-none cursor-default group"
    >
      {/* Monochromatic background glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.035) 0%, transparent 70%)",
        }}
      />

      {/* Top row: Number and Icon */}
      <div className="flex items-center justify-between" style={{ transform: "translateZ(20px)" }}>
        <span className="font-sans text-[10px] font-bold tracking-widest text-white/30 uppercase">
          {skill.num}
        </span>
        <div className="text-white/40 group-hover:text-white transition-colors duration-300">
          <Icon size={18} />
        </div>
      </div>

      {/* Title & Description */}
      <div className="my-3" style={{ transform: "translateZ(30px)" }}>
        <h3 className="font-serif text-lg font-light text-white tracking-wide uppercase">
          {skill.title}
        </h3>
        <p className="mt-2 text-xs font-light leading-relaxed text-white/50 group-hover:text-white/70 transition-colors duration-300">
          {skill.description}
        </p>
      </div>

      {/* Bottom row: Proficiency bar and tools */}
      <div className="space-y-3" style={{ transform: "translateZ(40px)" }}>
        {/* Proficiency Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-white/30 uppercase tracking-wider font-semibold">Proficiência</span>
            <span className="font-mono text-white/60">{skill.proficiency}%</span>
          </div>
          <div className="h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              style={{ width: isHovered ? `${skill.proficiency}%` : "0%" }}
              className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,1)]"
            />
          </div>
        </div>

        {/* Tool tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {skill.tools.map((tool, i) => (
            <span
              key={i}
              className="text-[9px] font-sans font-medium tracking-wide text-white/30 border border-white/[0.04] bg-white/[0.01] px-2 py-0.5 rounded-full"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BenefitsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <section
      ref={containerRef}
      id="benefits"
      className="py-24 md:py-36 border-t border-white/5 relative z-10 bg-black flex flex-col items-center select-none"
    >
      <div className="w-full max-w-6xl mx-auto px-6">
        {/* Title */}
        <motion.div
          style={{ x: smoothX, y: smoothY }}
          className="mb-16 md:mb-24 flex flex-col items-center md:items-start"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold mb-3">
            Habilidades / Skills
          </span>
          <h2 className="font-serif text-4xl uppercase text-white tracking-wider leading-none md:text-6xl">
            QA <span className="text-stroke font-light">Lab</span>
          </h2>
        </motion.div>

        {/* 3D Toolcards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {SKILLS.map((skill, index) => (
            <SkillCard key={index} skill={skill} />
          ))}
        </div>
      </div>
    </section>
  );
}
