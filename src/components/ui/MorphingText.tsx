/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";

interface MorphingTextProps {
  texts: string[];
  morphTime?: number;
  coolDownTime?: number;
  className?: string;
}

export default function MorphingText({
  texts,
  morphTime = 1.5,
  coolDownTime = 0.5,
  className = "",
}: MorphingTextProps) {
  const [textIndex, setTextIndex] = useState(0);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const morphRef = useRef(0);
  const coolDownRef = useRef(0);
  const timeRef = useRef(new Date());
  const textIndexRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const setStyles = (fraction: number) => {
      const el1 = text1Ref.current;
      const el2 = text2Ref.current;
      if (!el1 || !el2) return;

      el2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      el2.style.opacity = `${fraction ** 0.4 * 100}%`;

      const invertedFraction = 1 - fraction;
      el1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      el1.style.opacity = `${invertedFraction ** 0.4 * 100}%`;

      el1.textContent = texts[textIndexRef.current % texts.length];
      el2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    };

    const doMorph = () => {
      morphRef.current -= coolDownRef.current;
      coolDownRef.current = 0;

      let fraction = morphRef.current / morphTime;

      if (fraction > 1) {
        coolDownRef.current = coolDownTime;
        fraction = 1;
      }

      setStyles(fraction);

      if (fraction === 1) {
        textIndexRef.current++;
        setTextIndex(textIndexRef.current);
      }
    };

    const doCoolDown = () => {
      morphRef.current = 0;
      const el1 = text1Ref.current;
      const el2 = text2Ref.current;
      if (el1 && el2) {
        el2.style.filter = "none";
        el2.style.opacity = "100%";
        el1.style.filter = "none";
        el1.style.opacity = "0%";
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      coolDownRef.current -= dt;

      if (coolDownRef.current <= 0) {
        doMorph();
      } else {
        doCoolDown();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [texts, morphTime, coolDownTime]);

  return (
    <div
      className={`relative mx-auto h-16 w-full max-w-4xl text-center font-sans text-4xl font-bold md:h-24 lg:text-6xl ${className}`}
      style={{ filter: "url(#threshold) blur(0.6px)" }}
    >
      <span
        ref={text1Ref}
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
      />
      <span
        ref={text2Ref}
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
      />

      <svg id="filters" className="fixed h-0 w-0" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
