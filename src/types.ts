/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StoryPhase {
  phase: string;
  title: string;
  text: string;
  imageUrl?: string;
}

export interface CardData {
  id: number;
  title: string;
  projectName: string;
  category: string;
  imageUrl: string;
  story: StoryPhase[];
}

export interface HeroContent {
  titleLines: string[];
  scrollLabel: string;
}

export interface AboutContent {
  brand: string;
  portraitUrl: string;
  portraitAlt: string;
  experienceLabel: string;
  experienceValue: string;
  achievementsLabel: string;
  achievements: string[];
  hudStats: Array<{
    label: string;
    value: string;
  }>;
}

export interface CardViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type CardTransitionPhase = "idle" | "opening" | "open" | "closing";
