/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from "react";
import useFluidCursor from "../../hooks/useFluidCursor";

interface FluidCursorProps {
  isActive: boolean;
}

export default function FluidCursor({ isActive }: FluidCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFluidCursor(canvasRef);

  return (
    <div 
      className={`fixed inset-0 z-0 pointer-events-none w-screen h-screen transition-opacity duration-500 ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
