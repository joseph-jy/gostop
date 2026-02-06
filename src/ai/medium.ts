import { Card, CardType } from '../game/cards';
import { GameState } from '../game/state';
import { getValidMoves, findMatchingCards } from '../game/matching';

const GODORI_CARDS = ['february-yeol', 'april-yeol', 'august-yeol'];
const HONGDAN_CARDS = ['january-tti', 'february-tti', 'march-tti'];
const CHEONGDAN_CARDS = ['june-tti', 'september-tti', 'october-tti'];
const CHODAN_CARDS = ['april-tti', 'may-tti', 'july-tti'];

function canCompleteCombo(card: Card, aiCapture: Card[], field: Card[]): boolean {
  const matchingCards = findMatchingCards(card, field);
  if (matchingCards.length === 0) {
    return false;
  }

  const potentialCapture = [...aiCapture, card, ...matchingCards];
  const capturedIds = potentialCapture.map(c => c.id);

  const hasGodori = GODORI_CARDS.every(id => capturedIds.includes(id));
  const hasHongdan = HONGDAN_CARDS.every(id => capturedIds.includes(id));
  const hasCheongdan = CHEONGDAN_CARDS.every(id => capturedIds.includes(id));
  const hasChodan = CHODAN_CARDS.every(id => capturedIds.includes(id));

  const currentCapturedIds = aiCapture.map(c => c.id);
  const currentHasGodori = GODORI_CARDS.every(id => currentCapturedIds.includes(id));
  const currentHasHongdan = HONGDAN_CARDS.every(id => currentCapturedIds.includes(id));
  const currentHasCheongdan = CHEONGDAN_CARDS.every(id => currentCapturedIds.includes(id));
  const currentHasChodan = CHODAN_CARDS.every(id => currentCapturedIds.includes(id));

  return (
    (hasGodori && !currentHasGodori) ||
    (hasHongdan && !currentHasHongdan) ||
    (hasCheongdan && !currentHasCheongdan) ||
    (hasChodan && !currentHasChodan)
  );
}

export function selectMove(state: GameState, hand: Card[], field: Card[]): Card {
  const validMoves = getValidMoves(hand, field);

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
  opponentScore: number
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
