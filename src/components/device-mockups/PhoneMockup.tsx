import React from "react";

interface PhoneMockupProps {
  screenshot: string;
  title: string;
  isActive?: boolean;
  className?: string;
}

export default function PhoneMockup({ screenshot, title, isActive = true, className = "" }: PhoneMockupProps) {
  return (
    <div 
      className={`relative w-[190px] sm:w-[220px] aspect-[9/18.5] select-none drop-shadow-2xl transition-all duration-700 ${className}`}
      style={{ opacity: isActive ? 1 : 0.35, transform: isActive ? "scale(1)" : "scale(0.98)" }}
    >
      {/* Phone Outer Bezel */}
      <div className="relative w-full h-full bg-[#08080a] rounded-[24px] border-[2.5px] border-[#25252b] p-[4%] flex items-center justify-center">
        {/* Screen Display */}
        <div className="relative w-full h-full bg-[#111] overflow-hidden rounded-[20px] border border-black">
          <img 
            src={screenshot} 
            alt={title} 
            className="w-full h-full object-cover select-none" 
            referrerPolicy="no-referrer" 
            draggable={false} 
          />
          {/* Island */}
          <div className="absolute top-[2.5%] left-1/2 -translate-x-1/2 w-[35%] h-[3.5%] rounded-full bg-[#08080a] flex items-center justify-center" />
          {/* Screen Gloss */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
