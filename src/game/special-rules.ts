import { Card, Month } from './cards';

export function detectJjok(card: Card, field: Card[]): boolean {
  const sameMonthCards = field.filter((c) => c.month === card.month);
  return sameMonthCards.length === 2;
}

export function detectPpuk(card: Card, field: Card[]): boolean {
  const sameMonthCards = field.filter((c) => c.month === card.month);
  return sameMonthCards.length === 3;
}

function findMonthsByCount(hand: Card[], targetCount: number): Month[] {
  const monthCounts = new Map<Month, number>();

  for (const card of hand) {
    monthCounts.set(card.month, (monthCounts.get(card.month) || 0) + 1);
  }

  const months: Month[] = [];
  for (const [month, count] of monthCounts.entries()) {
    if (count === targetCount) {
      months.push(month);
    }
  }

  return months;
}

export function detectBomb(hand: Card[]): Month[] {
  return findMonthsByCount(hand, 3);
}

export function detectChongtong(hand: Card[]): Month[] {
  return findMonthsByCount(hand, 4);
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

// 쌌다: 핸드카드가 필드 1장 매칭 후, 덱 카드도 같은 달일 때
export function detectSsatda(handCard: Card, deckCard: Card): boolean {
  return handCard.month === deckCard.month;
}

export interface SsatdaResult {
  remainingField: Card[];
}

export function applySsatda(
  handCard: Card,
  _matchedFieldCard: Card,
  deckCard: Card,
  field: Card[],
): SsatdaResult {
  return { remainingField: [...field, handCard, deckCard] };
}

// 쪽났다: 핸드카드 매칭 없이 필드에 놓은 후, 덱 카드가 같은 달일 때
export function detectJjoknassda(handCard: Card, deckCard: Card): boolean {
  return handCard.month === deckCard.month;
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
