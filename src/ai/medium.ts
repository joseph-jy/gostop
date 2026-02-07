import { Card, CardType } from '../game/cards';
import { GameState } from '../game/state';
import { getValidMoves, findMatchingCards } from '../game/matching';
import { GODORI_IDS, HONGDAN_IDS, CHEONGDAN_IDS, CHODAN_IDS } from '../game/combos';

function canCompleteCombo(card: Card, aiCapture: Card[], field: Card[]): boolean {
  const matchingCards = findMatchingCards(card, field);
  if (matchingCards.length === 0) {
    return false;
  }

  const potentialCapture = [...aiCapture, card, ...matchingCards];
  const capturedIds = potentialCapture.map(c => c.id);

  const hasGodori = GODORI_IDS.every(id => capturedIds.includes(id));
  const hasHongdan = HONGDAN_IDS.every(id => capturedIds.includes(id));
  const hasCheongdan = CHEONGDAN_IDS.every(id => capturedIds.includes(id));
  const hasChodan = CHODAN_IDS.every(id => capturedIds.includes(id));

  const currentCapturedIds = aiCapture.map(c => c.id);
  const currentHasGodori = GODORI_IDS.every(id => currentCapturedIds.includes(id));
  const currentHasHongdan = HONGDAN_IDS.every(id => currentCapturedIds.includes(id));
  const currentHasCheongdan = CHEONGDAN_IDS.every(id => currentCapturedIds.includes(id));
  const currentHasChodan = CHODAN_IDS.every(id => currentCapturedIds.includes(id));

  return (
    (hasGodori && !currentHasGodori) ||
    (hasHongdan && !currentHasHongdan) ||
    (hasCheongdan && !currentHasCheongdan) ||
    (hasChodan && !currentHasChodan)
  );
}

export function selectMove(state: GameState, hand: Card[], field: Card[], _knownCards: Card[]): Card {
  const validMoves = getValidMoves(hand);

  if (validMoves.length === 0) {
    return hand[0];
  }

  const gwangCards = validMoves.filter(card => {
    if (card.type !== CardType.Gwang) {
      return false;
    }
    const matchingCards = findMatchingCards(card, field);
    return matchingCards.length > 0;
  });

  if (gwangCards.length > 0) {
    return gwangCards[0];
  }

  const comboCards = validMoves.filter(card => 
    canCompleteCombo(card, state.aiCapture, field)
  );

  if (comboCards.length > 0) {
    return comboCards[0];
  }

  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
}

export function selectGoStop(
  score: number,
  myScore: number,
  opponentScore: number,
  _expectedScore: number
): 'go' | 'stop' {
  const lead = myScore - opponentScore;

  if (lead >= 10) {
    return 'stop';
  }

  if (score < 7) {
    return 'go';
  }

  return Math.random() < 0.7 ? 'stop' : 'go';
}
