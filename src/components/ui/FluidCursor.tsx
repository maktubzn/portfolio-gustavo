/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import useFluidCursor from "../../hooks/useFluidCursor";

interface FluidCursorProps {
  isActive: boolean;
  theme?: "light" | "dark";
  className?: string;
}

export default function FluidCursor({ isActive, theme = "dark", className }: FluidCursorProps) {
  const [canRunWebGL, setCanRunWebGL] = useState(false);

  useEffect(() => {
    const capabilityQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const updateCapability = () => {
      setCanRunWebGL(capabilityQuery.matches && motionQuery.matches);
    };

    updateCapability();
    capabilityQuery.addEventListener("change", updateCapability);
    motionQuery.addEventListener("change", updateCapability);

    return () => {
      capabilityQuery.removeEventListener("change", updateCapability);
      motionQuery.removeEventListener("change", updateCapability);
    };
  }, []);

  if (!isActive || !canRunWebGL) return null;

  return <FluidCursorCanvas theme={theme} className={className} />;
}

function FluidCursorCanvas({ theme, className }: Pick<FluidCursorProps, "theme" | "className">) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFluidCursor(canvasRef, true, theme);

  const defaultClasses = "fixed inset-0 z-0 w-screen h-screen opacity-100";

  return (
    <div className={`${className || defaultClasses} pointer-events-none`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
