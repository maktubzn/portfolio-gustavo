import React from "react";

interface MonitorMockupProps {
  screenshot: string;
  title: string;
  isActive?: boolean;
  className?: string;
}

export default function MonitorMockup({ screenshot, title, isActive = true, className = "" }: MonitorMockupProps) {
  return (
    <div 
      className={`relative w-full max-w-[480px] flex flex-col items-center justify-center select-none drop-shadow-2xl transition-all duration-700 ${className}`}
      style={{ opacity: isActive ? 1 : 0.35, transform: isActive ? "scale(1)" : "scale(0.98)" }}
    >
      {/* Monitor Frame */}
      <div className="relative w-[90%] aspect-[16/9] bg-[#0c0c0e] rounded-md border-[2.5px] border-[#25252b] flex items-center justify-center p-[1.5%]">
        <div className="relative w-full h-full bg-[#111] overflow-hidden rounded-[2px] border border-black">
          <img 
            src={screenshot} 
            alt={title} 
            className="w-full h-full object-cover select-none" 
            referrerPolicy="no-referrer" 
            draggable={false} 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
        </div>
      </div>
      {/* Monitor Stand Column */}
      <div className="w-3.5 h-5 bg-gradient-to-b from-[#2a2a30] to-[#1c1c20] border-x border-[#3a3a42] -mt-[1px]" />
      {/* Monitor Stand Base */}
      <div className="w-16 h-1.5 bg-gradient-to-r from-[#1c1c20] via-[#2a2a30] to-[#1c1c20] rounded-t-sm border-t border-[#3a3a42]" />
    </div>
  );
}
