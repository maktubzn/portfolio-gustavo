/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from "react";
import useFluidCursor from "../../hooks/useFluidCursor";

interface FluidCursorProps {
  isActive: boolean;
  theme?: "light" | "dark";
  className?: string;
}

export default function FluidCursor({ isActive, theme = "dark", className }: FluidCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFluidCursor(canvasRef, isActive, theme);

  const defaultClasses = `fixed inset-0 z-0 w-screen h-screen transition-opacity duration-500 ${
    isActive ? "opacity-100" : "opacity-0"
  }`;

  return (
    <div className={`${className || defaultClasses} pointer-events-none`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
