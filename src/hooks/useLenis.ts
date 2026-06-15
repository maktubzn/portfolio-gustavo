import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

/**
 * useLenis
 * 
 * O que faz: Inicializa e expõe a instância do Lenis smooth scroll no viewport.
 * Onde é usado: App.tsx (uma única vez, no ponto de entrada).
 * 
 * ATENÇÃO: NÃO instanciar mais de uma vez.
 * NÃO usar autoRaf: true — o ticker do GSAP gerencia o loop.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Inicialização do Lenis no viewport (window)
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      syncTouch: false, // scroll nativo no touch (sem lag em mobile)
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    // Sincroniza o scroll suavizado do Lenis com ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Conecta Lenis ao ticker do GSAP
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000); // time em segundos → raf espera milissegundos
    };
    gsap.ticker.add(updateTicker);

    // Sem isso, o GSAP adiciona delay artificial que desincroniza do Lenis
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
      (window as any).lenis = undefined;
    };
  }, []);

  return { lenisRef };
}
