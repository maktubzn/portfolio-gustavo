/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Refs for tracking position and lerped motion
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect mobile touch devices safely
    const isTouch = 
      "ontouchstart" in window || 
      navigator.maxTouchPoints > 0 || 
      window.matchMedia("(pointer: coarse)").matches;
    
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    // Use global delegation to detect hovering on elements with data-view-hover attribute
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest("[data-view-hover]")) {
        setIsHovered(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && !target.closest("[data-view-hover]")) {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Linear interpolation loop for smooth mouse lag
    const updateCursor = () => {
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;

      const currentX = cursorRef.current.x;
      const currentY = cursorRef.current.y;

      // Lerp formula: current + (target - current) * factor
      const nextX = currentX + (targetX - currentX) * 0.14;
      const nextY = currentY + (targetY - currentY) * 0.14;

      cursorRef.current = { x: nextX, y: nextY };
      setPosition({ x: nextX, y: nextY });

      requestRef.current = requestAnimationFrame(updateCursor);
    };

    requestRef.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) {
    return null;
  }

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) translate3d(-50%, -50%, 0)`,
      }}
      className={`fixed top-0 left-0 pointer-events-none z-50 flex items-center justify-center rounded-full transition-transform-width duration-300 ease-out transition-cursor ${
        isHovered
          ? "w-14 h-14 bg-white text-black text-[9px] font-sans font-medium uppercase tracking-[0.15em] shadow-[0_0_15px_rgba(255,255,255,0.7)]"
          : "w-3 h-3 bg-white/70 border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
      }`}
    >
      {isHovered && <span className="opacity-0 animate-fade-in" style={{ animation: "fadeIn 0.2s forwards 0.1s" }}>View</span>}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
