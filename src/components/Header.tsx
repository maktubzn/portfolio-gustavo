/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  isAboutActive?: boolean;
  isLightZoneActive?: boolean;
}

export default function Header({ isAboutActive = false, isLightZoneActive = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Sobre", targetId: "about" },
    { label: "Projetos", targetId: "portfolio" },
    { label: "QA Lab", targetId: "benefits" },
    { label: "Contato", targetId: "footer" },
  ];

  const scrollToTarget = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(target);
      return;
    }

    target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 px-6 py-6 md:px-12 flex items-center justify-between pointer-events-none transition-all duration-700 ${
        isAboutActive ? "opacity-0 translate-y-[-20px] pointer-events-none" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="pointer-events-auto flex items-center select-none">
        <a
          href="#hero"
          onClick={(event) => {
            event.preventDefault();
            scrollToTarget("hero");
          }}
          className={`font-sans font-bold text-[14px] md:text-[15px] tracking-[0.1em] uppercase no-underline transition-colors ${
            isLightZoneActive ? "text-zinc-950 hover:text-zinc-700" : "text-white hover:text-white/80"
          }`}
        >
          Gustavo Alves
        </a>
      </div>

      <nav
        className={`absolute top-4 left-1/2 -translate-x-1/2 hidden md:flex pointer-events-auto items-center justify-center backdrop-blur-xl py-2 px-6 rounded-full space-x-7 z-50 transition-colors duration-500 ${
          isLightZoneActive
            ? "border border-black/10 bg-white/70 shadow-[0_12px_40px_rgba(24,20,16,0.12)]"
            : "border border-white/[0.08] bg-black/40 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
        }`}
      >
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={`#${item.targetId}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToTarget(item.targetId);
            }}
            className={`font-sans text-[11px] font-medium tracking-[0.12em] uppercase no-underline transition-all duration-300 relative group ${
              isLightZoneActive ? "text-zinc-600 hover:text-zinc-950" : "text-white/60 hover:text-white"
            }`}
          >
            {item.label}
            <span
              className={`absolute bottom-[-4px] left-1/2 w-0 h-[1.5px] rounded-full transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                isLightZoneActive ? "bg-zinc-950" : "bg-white"
              }`}
            />
          </a>
        ))}
      </nav>

      <div className="hidden md:block w-[110px]" />

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`pointer-events-auto md:hidden p-2 z-50 cursor-pointer backdrop-blur-lg rounded-full focus:outline-none focus-visible:ring-2 transition-colors ${
          isLightZoneActive
            ? "text-zinc-800 hover:text-zinc-950 border border-black/10 bg-white/70 focus-visible:ring-black/30"
            : "text-white/80 hover:text-white border border-white/[0.08] bg-black/40 focus-visible:ring-white/60"
        }`}
        aria-label="Alternar menu de navegacao"
      >
        {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/98 z-40 flex flex-col items-center justify-center space-y-8 animate-fade-in pointer-events-auto">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={`#${item.targetId}`}
              onClick={() => {
                setMobileMenuOpen(false);
                setTimeout(() => scrollToTarget(item.targetId), 100);
              }}
              className="text-white/60 hover:text-white font-sans text-lg tracking-[0.16em] uppercase no-underline transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
