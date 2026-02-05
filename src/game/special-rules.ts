import { Card, Month } from './cards';

export function detectJjok(card: Card, field: Card[]): boolean {
  const sameMonthCards = field.filter((c) => c.month === card.month);
  return sameMonthCards.length === 2;
}

export function detectPpuk(card: Card, field: Card[]): boolean {
  const sameMonthCards = field.filter((c) => c.month === card.month);
  return sameMonthCards.length === 3;
}

export function detectBomb(hand: Card[]): Month[] {
  const monthCounts = new Map<Month, number>();

  for (const card of hand) {
    monthCounts.set(card.month, (monthCounts.get(card.month) || 0) + 1);
  }

  const bombMonths: Month[] = [];
  for (const [month, count] of monthCounts.entries()) {
    if (count === 3) {
      bombMonths.push(month);
    }
  }

  return bombMonths;
}

export function detectChongtong(hand: Card[]): Month[] {
  const monthCounts = new Map<Month, number>();

  for (const card of hand) {
    monthCounts.set(card.month, (monthCounts.get(card.month) || 0) + 1);
  }

  const chongtongMonths: Month[] = [];
  for (const [month, count] of monthCounts.entries()) {
    if (count === 4) {
      chongtongMonths.push(month);
    }
  }

  return chongtongMonths;
}

export function canShake(card: Card, hand: Card[], field: Card[]): boolean {
  const sameMonthInField = field.filter((c) => c.month === card.month);
  const hasCardInHand = hand.some((c) => c.month === card.month);

  return sameMonthInField.length === 2 && hasCardInHand;
}

export interface JjokResult {
  captured: Card[];
  remainingField: Card[];
  stolenPi: Card[];
}

export function applyJjok(
  card: Card,
  field: Card[],
  opponentPi: Card[]
): JjokResult {
  const sameMonthCards = field.filter((c) => c.month === card.month);
  const otherCards = field.filter((c) => c.month !== card.month);

  const captured = [card, ...sameMonthCards];
  const stolenPi = opponentPi.length > 0 ? [opponentPi[0]] : [];

  return {
    captured,
    remainingField: otherCards,
    stolenPi,
  };
}

export interface PpukResult {
  captured: Card[];
  remainingField: Card[];
}

export function applyPpuk(card: Card, field: Card[]): PpukResult {
  const sameMonthCards = field.filter((c) => c.month === card.month);
  const otherCards = field.filter((c) => c.month !== card.month);

  const captured = [card, ...sameMonthCards];

  return {
    captured,
    remainingField: otherCards,
  };
}

export interface BombResult {
  captured: Card[];
  remainingHand: Card[];
  remainingField: Card[];
  stolenPi: Card[];
}

export function applyBomb(
  month: Month,
  hand: Card[],
  field: Card[],
  opponentPi: Card[]
): BombResult {
  const bombCards = hand.filter((c) => c.month === month);
  const remainingHand = hand.filter((c) => c.month !== month);

  const fieldSameMonthCards = field.filter((c) => c.month === month);
  const remainingField = field.filter((c) => c.month !== month);

  const captured = [...bombCards, ...fieldSameMonthCards];
  const stolenPi = opponentPi.length > 0 ? [opponentPi[0]] : [];

  return {
    captured,
    remainingHand,
    remainingField,
    stolenPi,
  };
}

export interface ChongtongResult {
  captured: Card[];
  remainingHand: Card[];
  stolenPi: Card[];
}

export function applyChongtong(
  month: Month,
  hand: Card[],
  opponentPi: Card[]
): ChongtongResult {
  const chongtongCards = hand.filter((c) => c.month === month);
  const remainingHand = hand.filter((c) => c.month !== month);

  const stolenCount = Math.min(2, opponentPi.length);
  const stolenPi = opponentPi.slice(0, stolenCount);

  return {
    captured: chongtongCards,
    remainingHand,
    stolenPi,
  };
}

export interface ShakeResult {
  multiplier: number;
  success: boolean;
}

export function applyShake(
  success: boolean,
  currentMultiplier: number
): ShakeResult {
  if (success) {
    return {
      multiplier: currentMultiplier * 2,
      success: true,
    };
  } else {
    return {
      multiplier: 1,
      success: false,
    };
  }
}
