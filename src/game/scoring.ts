import { Card, CardType } from './cards';

export interface CapturedCards {
  gwang: Card[];
  yeol: Card[];
  tti: Card[];
  pi: Card[];
}

export interface PlayerScore {
  gwang: number;
  yeol: number;
  tti: number;
  pi: number;
  total: number;
}

export interface BonusResult {
  finalScore: number;
  bonuses: string[];
  multiplier: number;
}

const DOUBLE_PI_IDS = ['november-pi-double', 'december-pi-double'];
const BIGWANG_ID = 'december-gwang';

export function calculatePiScore(cards: Card[]): number {
  const piCards = cards.filter(card => card.type === CardType.Pi);
  
  let piCount = 0;
  for (const card of piCards) {
    if (DOUBLE_PI_IDS.includes(card.id)) {
      piCount += 2;
    } else {
      piCount += 1;
    }
  }
  
  if (piCount >= 10) {
    return piCount - 9;
  }
  
  return 0;
}

export function calculateGwangScore(cards: Card[]): number {
  const gwangCards = cards.filter(card => card.type === CardType.Gwang);
  const gwangCount = gwangCards.length;
  
  if (gwangCount < 3) {
    return 0;
  }
  
  if (gwangCount === 5) {
    return 15;
  }
  
  if (gwangCount === 4) {
    return 4;
  }
  
  const hasBigwang = gwangCards.some(card => card.id === BIGWANG_ID);
  
  if (hasBigwang) {
    return 2;
  }
  
  return 3;
}

export function calculateTtiScore(cards: Card[]): number {
  const ttiCards = cards.filter(card => card.type === CardType.Tti);
  const ttiCount = ttiCards.length;
  
  if (ttiCount >= 5) {
    return ttiCount - 4;
  }
  
  return 0;
}

export function calculateYeolScore(cards: Card[]): number {
  const yeolCards = cards.filter(card => card.type === CardType.Yeol);
  const yeolCount = yeolCards.length;
  
  if (yeolCount >= 5) {
    return yeolCount - 4;
  }
  
  return 0;
}

export function calculateTotal(capture: CapturedCards): PlayerScore {
  const gwangScore = calculateGwangScore(capture.gwang);
  const yeolScore = calculateYeolScore(capture.yeol);
  const ttiScore = calculateTtiScore(capture.tti);
  const piScore = calculatePiScore(capture.pi);
  
  return {
    gwang: gwangScore,
    yeol: yeolScore,
    tti: ttiScore,
    pi: piScore,
    total: gwangScore + yeolScore + ttiScore + piScore,
  };
}

export function applyBonus(
  playerScore: PlayerScore,
  opponentScore: PlayerScore,
  _playerCapture: CapturedCards,
  opponentCapture: CapturedCards
): BonusResult {
  const bonuses: string[] = [];
  let multiplier = 1;
  
  if (opponentScore.pi === 0) {
    bonuses.push('피박');
    multiplier *= 2;
  }
  
  if (opponentScore.gwang === 0) {
    bonuses.push('광박');
    multiplier *= 2;
  }
  
  const opponentYeolCount = opponentCapture.yeol.length;
  if (opponentYeolCount === 0 && playerScore.total > opponentScore.total) {
    bonuses.push('멍텅구리');
    multiplier *= 2;
  }
  
  return {
    finalScore: playerScore.total * multiplier,
    bonuses,
    multiplier,
  };
}
