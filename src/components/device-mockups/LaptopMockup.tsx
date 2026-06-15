import React from "react";

interface LaptopMockupProps {
  screenshot: string;
  title: string;
  isActive?: boolean;
  className?: string;
}

export default function LaptopMockup({ screenshot, title, isActive = true, className = "" }: LaptopMockupProps) {
  return (
    <div 
      className={`relative w-full max-w-[480px] flex flex-col items-center justify-center select-none drop-shadow-2xl transition-all duration-700 ${className}`}
      style={{ opacity: isActive ? 1 : 0.35, transform: isActive ? "scale(1)" : "scale(0.98)" }}
    >
      {/* Screen Lid */}
      <div className="relative w-[90%] aspect-[16/10] bg-[#0c0c0e] rounded-t-md border-[2.5px] border-[#25252b] flex items-center justify-center p-[1.8%]">
        {/* Screen Display */}
        <div className="relative w-full h-full bg-[#111] overflow-hidden rounded-[3px] border border-black">
          <img 
            src={screenshot} 
            alt={title} 
            className="w-full h-full object-cover select-none" 
            referrerPolicy="no-referrer" 
            draggable={false} 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
        </div>
        {/* Web Camera */}
        <div className="absolute top-[1.2%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
      </div>
      {/* Laptop Keyboard Base */}
      <div className="relative w-full h-3 bg-gradient-to-b from-[#2a2a30] via-[#1c1c20] to-[#0c0c0e] rounded-b-md border-t border-[#3a3a42] flex items-center justify-center">
        {/* Display open slot */}
        <div className="w-[12%] h-0.5 bg-[#0c0c0e] rounded-b-sm -mt-1" />
      </div>
    </div>
  );
}
