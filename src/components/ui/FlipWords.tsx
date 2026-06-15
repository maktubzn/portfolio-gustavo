/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";

interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}

export default function FlipWords({
  words,
  duration = 3000,
  className = "",
}: FlipWordsProps) {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    const currentIndex = words.indexOf(currentWord);
    const nextWord = words[currentIndex + 1] || words[0];
    setCurrentWord(nextWord);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating) {
      const id = setTimeout(() => {
        startAnimation();
      }, duration);
      return () => clearTimeout(id);
    }
  }, [isAnimating, duration, startAnimation]);

  return (
    <span className="relative inline-block whitespace-nowrap px-1">
      <AnimatePresence
        onExitComplete={() => {
          setIsAnimating(false);
        }}
      >
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            y: -12,
            filter: "blur(6px)",
            scale: 1.05,
            transition: { duration: 0.28 },
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.45,
          }}
          className={`relative z-10 inline-block text-left text-neutral-900 dark:text-neutral-100 ${className}`}
        >
          {currentWord.split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block mr-1.5 whitespace-nowrap">
              {word.split("").map((letter, letterIndex) => (
                <motion.span
                  key={letterIndex}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    delay: wordIndex * 0.12 + letterIndex * 0.035,
                    duration: 0.25,
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
