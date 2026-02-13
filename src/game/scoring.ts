import { Card, CardType } from './cards';
import { DOUBLE_PI_IDS } from './constants';
import { RuleSet, STANDARD_RULESET } from './ruleset';
import { Turn } from './state';

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

export interface SettlementInput {
  playerCapture: CapturedCards;
  aiCapture: CapturedCards;
  playerGoCount: number;
  aiGoCount: number;
  playerComboScore: number;
  aiComboScore: number;
  shakingMultiplier: number;
  ruleSet?: RuleSet;
  declaredWinner?: Turn;
  bakFlags?: { player: boolean; ai: boolean };
  dokbakOwner?: Turn | null;
}

export interface SettlementResult {
  playerFinal: number;
  aiFinal: number;
  winner: Turn;
  winnerBonuses: string[];
  isNagari: boolean;
}
const BIGWANG_ID = 'december-gwang';

export function calculatePiCount(cards: Card[]): number {
  const piCards = cards.filter(card => card.type === CardType.Pi);
  let piCount = 0;
  for (const card of piCards) {
    if (DOUBLE_PI_IDS.includes(card.id)) {
      piCount += 2;
    } else {
      piCount += 1;
    }
  }
  return piCount;
}

export function calculatePiScore(cards: Card[]): number {
  const piCount = calculatePiCount(cards);
  
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
  opponentCapture: CapturedCards,
  _playerCapture?: CapturedCards,
  ruleSet: RuleSet = STANDARD_RULESET
): BonusResult {
  const bonuses: string[] = [];
  let multiplier = 1;

  const opponentPiCount = calculatePiCount(opponentCapture.pi);
  if (opponentPiCount <= ruleSet.piBakMaxPiCount) {
    bonuses.push('피박');
    multiplier *= 2;
  }

  if (playerScore.gwang >= 3 && opponentScore.gwang === 0) {
    bonuses.push('광박');
    multiplier *= 2;
  }

  const opponentYeolCount = opponentCapture.yeol.length;
  if (
    ruleSet.enableMeongteongguri &&
    playerScore.gwang >= 3 &&
    opponentYeolCount === 0 &&
    playerScore.total > opponentScore.total
  ) {
    bonuses.push('멍텅구리');
    multiplier *= 2;
  }
  
  return {
    finalScore: playerScore.total * multiplier,
    bonuses,
    multiplier,
  };
}

function getWinner(
  playerTotal: number,
  aiTotal: number,
  declaredWinner?: Turn
): Turn {
  if (declaredWinner) {
    return declaredWinner;
  }
  return playerTotal >= aiTotal ? 'player' : 'ai';
}

export function calculateSettlement(input: SettlementInput): SettlementResult {
  const ruleSet = input.ruleSet ?? STANDARD_RULESET;

  const playerScore = calculateTotal(input.playerCapture);
  const aiScore = calculateTotal(input.aiCapture);
  const playerTotal = playerScore.total + input.playerComboScore;
  const aiTotal = aiScore.total + input.aiComboScore;

  if (!input.declaredWinner && playerTotal === aiTotal) {
    return {
      playerFinal: playerTotal,
      aiFinal: aiTotal,
      winner: 'player',
      winnerBonuses: [],
      isNagari: true,
    };
  }

  const winner = getWinner(playerTotal, aiTotal, input.declaredWinner);
  const loser = winner === 'player' ? 'ai' : 'player';
  const winnerScore = winner === 'player' ? playerScore : aiScore;
  const loserScore = loser === 'player' ? playerScore : aiScore;
  const winnerCapture = winner === 'player' ? input.playerCapture : input.aiCapture;
  const loserCapture = loser === 'player' ? input.playerCapture : input.aiCapture;

  let winnerFinal = winner === 'player' ? playerTotal : aiTotal;
  const goCount = winner === 'player' ? input.playerGoCount : input.aiGoCount;
  const goMultiplier = goCount >= ruleSet.goMultiplierFromCount ? 2 : 1;
  winnerFinal *= goMultiplier;

  const bonus = applyBonus(winnerScore, loserScore, loserCapture, winnerCapture, ruleSet);
  winnerFinal = (winner === 'player' ? playerTotal : aiTotal) * goMultiplier * bonus.multiplier;

  if (winner === 'player') {
    winnerFinal *= input.shakingMultiplier;
  }

  if ((input.bakFlags?.[loser] ?? false) || (loser === 'player' && input.playerGoCount >= ruleSet.goBakMinGoCount) || (loser === 'ai' && input.aiGoCount >= ruleSet.goBakMinGoCount)) {
    winnerFinal *= 2;
  }

  if (input.dokbakOwner === loser) {
    winnerFinal *= 2;
  }

  const loserFinal = loser === 'player' ? playerTotal : aiTotal;

  return winner === 'player'
    ? {
        playerFinal: winnerFinal,
        aiFinal: loserFinal,
        winner,
        winnerBonuses: bonus.bonuses,
        isNagari: false,
      }
    : {
        playerFinal: loserFinal,
        aiFinal: winnerFinal,
        winner,
        winnerBonuses: bonus.bonuses,
        isNagari: false,
      };
}
