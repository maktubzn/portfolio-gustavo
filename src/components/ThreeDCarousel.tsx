/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CARDS_DATA } from "../data";
import { CardData, CardTransitionPhase, CardViewportRect } from "../types";
import LaptopMockup from "./device-mockups/LaptopMockup";
import MonitorMockup from "./device-mockups/MonitorMockup";
import PhoneMockup from "./device-mockups/PhoneMockup";

interface CarouselCard extends CardData {
  uniqueKey: string;
  originalIndex: number;
  duplicateIndex: number;
}

type DeviceKind = "laptop" | "phone" | "monitor";

function getDeviceKind(cardId: number): DeviceKind {
  if (cardId === 3) return "phone";
  if (cardId === 2) return "monitor";
  return "laptop";
}

function renderDevice(card: CardData) {
  const commonProps = {
    screenshot: card.imageUrl,
    title: card.projectName,
  };

  if (getDeviceKind(card.id) === "phone") {
    return <PhoneMockup {...commonProps} className="h-[92%]" />;
  }

  if (getDeviceKind(card.id) === "monitor") {
    return <MonitorMockup {...commonProps} className="max-w-[360px]" />;
  }

  return <LaptopMockup {...commonProps} className="max-w-[380px]" />;
}

interface ThreeDCarouselProps {
  onCardSelect: (cardId: number, originRect: CardViewportRect) => void;
  selectedCardId: number | null;
  transitionPhase: CardTransitionPhase;
}

export default function ThreeDCarousel({ onCardSelect, selectedCardId, transitionPhase }: ThreeDCarouselProps) {
  const [rotation, setRotation] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 390));
  const [isInteracting, setIsInteracting] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const prevRotationRef = useRef(0);
  
  const isDragging = useRef(false);
  const isCentering = useRef(false);
  const hasMovedRef = useRef(false);
  
  const startX = useRef(0);
  const startRotation = useRef(0);
  const lastInteractionTime = useRef(Date.now());
  const targetRotation = useRef(0);
  const pendingOpenCardIndex = useRef<number | null>(null);
  const activePointerId = useRef<number | null>(null);
  const tappedCardIndex = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);
  const onCardSelectRef = useRef(onCardSelect);

  useEffect(() => {
    onCardSelectRef.current = onCardSelect;
  }, [onCardSelect]);

  // Synchronized refs to avoid stale closures in native passive event listeners
  const isMobileRef = useRef(isMobile);
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  const reduceMotionRef = useRef(reduceMotion);
  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  const selectedCardIdRef = useRef(selectedCardId);
  useEffect(() => {
    selectedCardIdRef.current = selectedCardId;
    if (selectedCardId === null) {
      // Instantly restore interaction timing so auto-rotation can resume after 3s when modal is closed
      lastInteractionTime.current = Date.now();
    }
  }, [selectedCardId]);

  const transitionPhaseRef = useRef(transitionPhase);
  useEffect(() => {
    transitionPhaseRef.current = transitionPhase;
  }, [transitionPhase]);

  // Responsive device check
  useEffect(() => {
    const checkViewport = () => {
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      setViewportWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768 || coarsePointer);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(motionQuery.matches);
    updateMotion();
    motionQuery.addEventListener("change", updateMotion);
    return () => motionQuery.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { root: null, rootMargin: "180px 0px", threshold: 0 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Normalizes any angle to stay within [-180, 180] range
  const normalizeAngle = (angle: number) => {
    let norm = angle % 360;
    if (norm > 180) norm -= 360;
    if (norm < -180) norm += 360;
    return norm;
  };

  // Safe Math helpers for calculation
  const getCardCylinderAngle = (index: number, total: number) => {
    return index * (360 / total);
  };

  const carouselCards = useMemo<CarouselCard[]>(() => {
    const originalLength = CARDS_DATA.length;
    if (originalLength === 0) return [];
    
    if (originalLength >= 6) {
      return CARDS_DATA.map((card, index) => ({
        ...card,
        uniqueKey: `${card.id}-0`,
        originalIndex: index,
        duplicateIndex: 0,
      }));
    }
    
    const multiplier = Math.ceil(8 / originalLength);
    const result: CarouselCard[] = [];
    for (let m = 0; m < multiplier; m++) {
      for (let i = 0; i < originalLength; i++) {
        const card = CARDS_DATA[i];
        result.push({
          ...card,
          uniqueKey: `${card.id}-${m}`,
          originalIndex: i,
          duplicateIndex: m,
        });
      }
    }
    return result;
  }, []);

  const totalCards = carouselCards.length;
  const cardWidth = isMobile ? Math.min(228, Math.max(190, viewportWidth * 0.58)) : Math.min(360, Math.max(300, viewportWidth * 0.24));
  const cardHeight = isMobile ? Math.round(cardWidth * 1.12) : Math.round(cardWidth * 0.82);
  const radius = isMobile ? Math.min(200, Math.max(170, viewportWidth * 0.5)) : Math.min(640, Math.max(460, viewportWidth * 0.42));

  const getCenterTargetRotation = useCallback((cardIndex: number) => {
    if (cardIndex < 0 || cardIndex >= totalCards) return rotationRef.current;

    const angleStep = 360 / totalCards;
    const baseTarget = -cardIndex * angleStep;
    const nearestTurn = Math.round((rotationRef.current - baseTarget) / 360);
    return baseTarget + nearestTurn * 360;
  }, [totalCards]);

  const buildCardView = useCallback((card: CarouselCard, idx: number, rotationValue: number) => {
    const cardAngle = getCardCylinderAngle(idx, totalCards);
    const relativeAngle = normalizeAngle(cardAngle + rotationValue);
    const absAngle = Math.abs(relativeAngle);
    const rad = (relativeAngle * Math.PI) / 180;
    const tx = Math.sin(rad) * radius;
    const tz = (Math.cos(rad) - 1) * radius;
    const rotateYAngle = relativeAngle;

    let opacity = 0;
    let scale = 0.5;

    const visibleAngle = isMobile ? 72 : 120;
    if (absAngle <= visibleAngle) {
      const factor = absAngle / visibleAngle;
      opacity = 1 - (isMobile ? 0.48 : 0.7) * factor;
      scale = 1 - (isMobile ? 0.24 : 0.5) * factor;
    }

    const visualWidth = cardWidth * scale;
    const visualHeight = cardHeight * scale;
    const sideCompression = absAngle < 18 ? 1 : isMobile ? 0.78 : 0.74;
    const hitWidth = Math.max(isMobile ? 74 : 110, visualWidth * sideCompression);
    const hitHeight = Math.max(isMobile ? 120 : 170, visualHeight * 0.96);

    return {
      card,
      uniqueKey: card.uniqueKey,
      index: idx,
      absAngle,
      hitHeight,
      hitWidth,
      opacity,
      rotateYAngle,
      scale,
      tx,
      tz,
      visualHeight,
      visualWidth,
      zDepthIndex: Math.round((Math.cos(rad) + 1) * 100),
    };
  }, [cardHeight, cardWidth, isMobile, radius, totalCards]);

  const cardViews = useMemo(
    () => carouselCards
      .map((card, idx) => buildCardView(card, idx, rotation))
      .filter((view) => view.opacity > 0.01),
    [buildCardView, carouselCards, rotation]
  );

  const getCardViewportRect = useCallback((cardIndex: number, rotationValue: number): CardViewportRect | null => {
    const container = containerRef.current;
    if (!container || cardIndex < 0 || cardIndex >= carouselCards.length) return null;

    const view = buildCardView(carouselCards[cardIndex], cardIndex, rotationValue);
    const containerRect = container.getBoundingClientRect();

    return {
      left: containerRect.left + containerRect.width / 2 + view.tx - view.visualWidth / 2,
      top: containerRect.top + containerRect.height / 2 - view.visualHeight / 2,
      width: view.visualWidth,
      height: view.visualHeight,
    };
  }, [buildCardView, carouselCards]);

  const openCardFromCurrentRotation = useCallback((cardIndex: number) => {
    if (cardIndex < 0 || cardIndex >= carouselCards.length) return;
    const card = carouselCards[cardIndex];
    const rect = getCardViewportRect(cardIndex, rotationRef.current);
    if (!rect || selectedCardIdRef.current !== null) return;

    lastInteractionTime.current = Date.now() + 1000 * 60 * 60;
    velocityRef.current = 0;
    onCardSelectRef.current(card.id, rect);
  }, [getCardViewportRect, carouselCards]);

  // Main high-precision physics looping
  useEffect(() => {
    if (!isInView) return;

    let active = true;

    const loop = () => {
      if (!active) return;

      const now = Date.now();
      const timeSinceInteraction = now - lastInteractionTime.current;
      let cardIndexToOpenAfterCenter: number | null = null;

      if (isDragging.current) {
        // Drag calculations are live-updated by listeners
      } else if (isCentering.current) {
        const diff = targetRotation.current - rotationRef.current;
        rotationRef.current += diff * (isMobileRef.current ? 0.24 : 0.22);
        
        // Snap when extremely close
        if (Math.abs(diff) < 0.9) {
          rotationRef.current = targetRotation.current;
          isCentering.current = false;
          cardIndexToOpenAfterCenter = pendingOpenCardIndex.current;
          pendingOpenCardIndex.current = null;
        }
      } else {
        // Apply friction and inertia decay
        if (Math.abs(velocityRef.current) > 0.05) {
          rotationRef.current += velocityRef.current;
          velocityRef.current *= isMobileRef.current ? 0.88 : 0.94; // friction
        } else {
          velocityRef.current = 0;

          // Auto-rotate slowly (counter-clockwise) to intrigue users
          if (
            timeSinceInteraction > 3000 &&
            selectedCardIdRef.current === null &&
            transitionPhaseRef.current === "idle" &&
            !isMobileRef.current &&
            !reduceMotionRef.current
          ) {
            rotationRef.current += 0.08; // slow majestic velocity on desktop only
          }
        }
      }

      setRotation(rotationRef.current);

      if (cardIndexToOpenAfterCenter !== null) {
        const indexToOpen = cardIndexToOpenAfterCenter;
        requestAnimationFrame(() => openCardFromCurrentRotation(indexToOpen));
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [openCardFromCurrentRotation, isInView]);

  // Drag Interactions via Pointer Events
  const handleDragStart = (clientX: number) => {
    if (selectedCardIdRef.current !== null || transitionPhaseRef.current !== "idle") return;
    
    isDragging.current = true;
    isCentering.current = false;
    pendingOpenCardIndex.current = null;
    hasMovedRef.current = false;
    startX.current = clientX;
    startRotation.current = rotationRef.current;
    prevRotationRef.current = rotationRef.current;
    velocityRef.current = 0;
    lastInteractionTime.current = Date.now();
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    
    const deltaX = clientX - startX.current;
    
    // Smooth responsive mapping factor
    const dragFactor = isMobileRef.current ? 0.18 : 0.22;
    
    rotationRef.current = startRotation.current + (deltaX * dragFactor);
    velocityRef.current = rotationRef.current - prevRotationRef.current;
    prevRotationRef.current = rotationRef.current;
    lastInteractionTime.current = Date.now();

    const threshold = isMobileRef.current ? 10 : 8;
    if (Math.abs(deltaX) > threshold) {
      hasMovedRef.current = true;
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsInteracting(false);
    lastInteractionTime.current = Date.now();
    
    // Clamp velocity if users flicked fast to maintain elegant flow.
    if (isMobileRef.current) {
      velocityRef.current = 0;
      const angleStep = 360 / totalCards;
      const nearestIndex = Math.round(-rotationRef.current / angleStep);
      targetRotation.current = -nearestIndex * angleStep;
      isCentering.current = true;
      return;
    }

    velocityRef.current = Math.min(12, Math.max(-12, velocityRef.current));
  };

  const openCardByHitbox = useCallback((cardIndex: number) => {
    if (selectedCardIdRef.current !== null || transitionPhaseRef.current !== "idle") return;

    const target = getCenterTargetRotation(cardIndex);
    const distance = Math.abs(target - rotationRef.current);

    velocityRef.current = 0;
    lastInteractionTime.current = Date.now() + 1000 * 60 * 60;

    if (distance < 0.8) {
      isCentering.current = false;
      pendingOpenCardIndex.current = null;
      openCardFromCurrentRotation(cardIndex);
      return;
    }

    targetRotation.current = target;
    pendingOpenCardIndex.current = cardIndex;
    isCentering.current = true;
  }, [getCenterTargetRotation, openCardFromCurrentRotation]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (selectedCardIdRef.current !== null || transitionPhaseRef.current !== "idle") return;

    const hitTarget = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-carousel-hit-card]");

    activePointerId.current = event.pointerId;
    tappedCardIndex.current = hitTarget?.dataset.cardIndex ? Number(hitTarget.dataset.cardIndex) : null;
    setIsInteracting(true);

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture can fail if the pointer is already gone; the gesture will simply end normally.
    }

    handleDragStart(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) return;
    handleDragMove(event.clientX);
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) return;

    const shouldOpen = !hasMovedRef.current && tappedCardIndex.current !== null;
    const cardIndex = tappedCardIndex.current;

    activePointerId.current = null;
    tappedCardIndex.current = null;

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Release is best-effort because browsers auto-release on pointerup.
    }

    if (shouldOpen && cardIndex !== null) {
      isDragging.current = false;
      velocityRef.current = 0;
      setIsInteracting(false);
      openCardByHitbox(cardIndex);
      return;
    }

    handleDragEnd();
  };

  const hasActiveTransition = selectedCardId !== null && transitionPhase !== "idle";

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-7xl mx-auto h-[330px] sm:h-[350px] md:h-[330px] lg:h-[350px] xl:h-[430px] relative flex items-center justify-center pt-1 pb-2 md:pt-2 md:pb-4 xl:pt-5 xl:pb-8 select-none select-none-touch perspective-container overflow-visible ${
        isInteracting ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* 3D Cylinder Container */}
      <div className="pointer-events-none w-full h-full relative preserve-3d flex items-center justify-center">
        {cardViews.map((view) => {
          const { card } = view;
          const isSelected = card.id === selectedCardId;
          const isOtherCardBlurred = hasActiveTransition && !isSelected;
          const isSelectedCardHidden = hasActiveTransition && isSelected;

          // Apply selective blurring and opacity when another card is active
          let finalOpacity = view.opacity;
          let finalBlur = "blur-none";

          if (isOtherCardBlurred) {
            finalOpacity = view.opacity * 0.15;
            finalBlur = "blur-[6px]";
          } else if (isSelectedCardHidden) {
            // Fade out the clicked central card slightly with a micro-delay to let modal take over
            finalOpacity = 0.0;
          }

          return (
            <div
              key={view.uniqueKey}
              data-carousel-card
              data-card-id={card.id}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                transform: `translateX(${view.tx}px) translateZ(${view.tz}px) rotateY(${view.rotateYAngle}deg) scale(${view.scale})`,
                transformOrigin: "50% 50%",
                opacity: finalOpacity,
                zIndex: view.zDepthIndex,
                transition: isDragging.current || isCentering.current 
                  ? "opacity 0.3s ease, filter 0.3s ease" 
                  : "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, filter 0.45s ease",
              }}
              className={`absolute flex shrink-0 select-none select-none-touch items-center justify-center overflow-visible ${finalBlur}`}
            >
              {/* Monochromatic Premium background glow halo */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[90%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[40px] transition-opacity duration-300"
                style={{
                  background: card.id === 1 
                    ? "radial-gradient(circle at center, rgba(255, 255, 255, 0.25) 0%, transparent 70%)"
                    : card.id === 2
                      ? "radial-gradient(circle at center, rgba(220, 220, 220, 0.2) 0%, transparent 70%)"
                      : card.id === 3
                        ? "radial-gradient(circle at center, rgba(240, 240, 240, 0.22) 0%, transparent 70%)"
                        : "radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
                }}
              />
              {/* Glassmorphic border wrap */}
              <div className="relative z-10 flex h-full w-full items-center justify-center border border-white/[0.08] bg-white/[0.02] backdrop-blur-md rounded-[20px] p-5 shadow-[0_24px_50px_rgba(0,0,0,0.65)] hover:border-white/20 transition-all duration-300">
                {renderDevice(card)}
              </div>
            </div>
          );
        })}
      </div>

      <div
        aria-label="Projetos do carrossel"
        className={`absolute inset-0 z-[250] ${hasActiveTransition ? "pointer-events-none" : "pointer-events-auto"}`}
        role="group"
        style={{ touchAction: "pan-y" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        {cardViews.map((view) => {
          const canHit = !hasActiveTransition && view.opacity > (isMobile ? 0.38 : 0.2);

          return (
            <button
              key={`hit-${view.uniqueKey}`}
              type="button"
              data-carousel-hit-card
              data-card-id={view.card.id}
              data-card-index={view.index}
              aria-label={`Abrir ${view.card.projectName}`}
              tabIndex={canHit ? 0 : -1}
              disabled={!canHit}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && canHit) {
                  event.preventDefault();
                  openCardByHitbox(view.index);
                }
              }}
              style={{
                width: `${view.hitWidth}px`,
                height: `${view.hitHeight}px`,
                left: `calc(50% + ${view.tx}px - ${view.hitWidth / 2}px)`,
                top: `calc(50% - ${view.hitHeight / 2}px)`,
                zIndex: view.zDepthIndex + 300,
                touchAction: "pan-y",
              }}
              className="absolute rounded-[18px] bg-transparent p-0 text-transparent outline-none disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <span className="sr-only">{view.card.projectName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
