/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from "react";
import { ShieldCheck, Cpu, Layers, FileText, Check } from "lucide-react";

const SERVICES = [
  {
    num: "01",
    icon: ShieldCheck,
    title: "Testes Manuais & QA",
    description: "Validação funcional de ponta a ponta, identificação sistemática de inconsistências e simulação de cenários reais de uso.",
    metrics: "Bugs e evidências em organização | Heurísticas de teste",
    techs: ["Manual Testing", "Postman", "DevTools", "Exploratórios"],
  },
  {
    num: "02",
    icon: Cpu,
    title: "Automação E2E",
    description: "Criação de scripts robustos para automação de testes de regressão em aplicações web e testes de integração.",
    metrics: "Fluxos E2E em evolução | Regressão guiada",
    techs: ["Playwright", "TypeScript", "Cypress", "CI/CD Actions"],
  },
  {
    num: "03",
    icon: Layers,
    title: "Auditoria Visual (UI/UX)",
    description: "Inspeção detalhada de layouts em múltiplos viewports, garantindo integridade de design e responsividade pixel-perfect.",
    metrics: "Auditoria responsiva | Cross-browser em validação",
    techs: ["Lighthouse", "Figma Inspect", "Responsive Debug"],
  },
  {
    num: "04",
    icon: FileText,
    title: "Documentação técnica",
    description: "Escrita técnica estruturada de planos de teste detalhados, relatórios de bugs inteligíveis e especificações.",
    metrics: "Planos e relatos | Markdown com passos reproduzíveis",
    techs: ["Markdown specs", "Jira boards", "Step-by-step guides"],
  },
];

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      id="services"
      className="services-light light-showcase py-24 md:py-36 border-t border-white/5 relative z-10 bg-black flex flex-col items-center select-none"
    >
      <div className="w-full max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Sticky Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold mb-3">
              O Que Eu Faço / What I Do
            </span>
            <h2 className="font-serif text-4xl uppercase text-white tracking-wider leading-none md:text-5xl lg:text-6xl mb-6">
              Serviç<span className="text-stroke font-light">os</span> & QA
            </h2>
            <p className="text-xs font-light leading-relaxed text-white/50 mb-8 max-w-sm">
              Processos estruturados e testes contínuos para garantir que cada funcionalidade e interface atinjam o mais alto nível de estabilidade.
            </p>

            {/* Interactive Reliability Meter Widget */}
            <div className="relative flex items-center gap-4 border border-white/[0.06] bg-[#09090b]/80 rounded-2xl p-5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] w-full max-w-[280px]">
              <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="stroke-white/[0.06] fill-none"
                    strokeWidth="3"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="stroke-white fill-none"
                    strokeWidth="3"
                    strokeDasharray="125.6"
                    strokeDashoffset="38"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))" }}
                  />
                </svg>
                <span className="font-mono text-[10px] font-bold text-white">QA</span>
              </div>
              <div className="text-left">
                <h4 className="text-[10px] uppercase tracking-wider font-semibold text-white/80">Evidências</h4>
                <p className="text-[9px] font-light text-white/45 mt-0.5">Casos e bugs documentados</p>
              </div>
            </div>
          </div>

          {/* Right Cards Stack Column */}
          <div className="lg:col-span-8 flex flex-col gap-6 w-full">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="relative flex flex-col md:flex-row md:items-center justify-between border border-white/[0.06] bg-[#09090b]/80 rounded-2xl p-6 shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20 hover:bg-white/[0.015] group overflow-hidden"
                >
                  {/* Background glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.015] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Left content block */}
                  <div className="flex-1 md:pr-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-xs font-bold text-white/30 tracking-wider">
                        /{service.num}
                      </span>
                      <span className="text-white/40 group-hover:text-white transition-colors duration-300">
                        <Icon size={16} />
                      </span>
                      <h3 className="font-serif text-lg font-light text-white tracking-wide uppercase">
                        {service.title}
                      </h3>
                    </div>

                    <p className="text-xs font-light leading-relaxed text-white/50 group-hover:text-white/70 transition-colors duration-500 mb-4">
                      {service.description}
                    </p>

                    {/* Deliverables details */}
                    <div className="flex items-center gap-2">
                      <Check size={12} className="text-white/30 shrink-0" />
                      <span className="font-mono text-[9px] text-white/45 group-hover:text-white/60 transition-colors">
                        {service.metrics}
                      </span>
                    </div>
                  </div>

                  {/* Right technology tag block */}
                  <div className="flex flex-wrap md:flex-col md:items-end gap-1.5 md:w-[170px] shrink-0 border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
                    {service.techs.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-sans font-medium tracking-wide text-white/40 border border-white/[0.04] bg-white/[0.02] px-2.5 py-0.5 rounded-full whitespace-nowrap"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
