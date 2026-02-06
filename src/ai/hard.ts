import { Card, CardType, CARDS } from '../game/cards';
import { GameState } from '../game/state';
import { getValidMoves, findMatchingCards, applyMatch } from '../game/matching';

const MONTE_CARLO_SIMULATIONS = 50;
const CARD_TYPE_VALUES: Record<CardType, number> = {
  [CardType.Gwang]: 20,
  [CardType.Yeol]: 10,
  [CardType.Tti]: 5,
  [CardType.Pi]: 1,
};

const DOUBLE_PI_IDS = ['november-pi-double', 'december-pi-double'];

function getCardValue(card: Card): number {
  const baseValue = CARD_TYPE_VALUES[card.type];
  if (card.type === CardType.Pi && DOUBLE_PI_IDS.includes(card.id)) {
    return baseValue * 2;
  }
  return baseValue;
}

function getRemainingCards(
  hand: Card[],
  field: Card[],
  knownCards: Card[]
): Card[] {
  const usedIds = new Set([
    ...hand.map(c => c.id),
    ...field.map(c => c.id),
    ...knownCards.map(c => c.id),
  ]);

  return CARDS.filter(card => !usedIds.has(card.id));
}

function sampleCards(cards: Card[], count: number): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function evaluateCapture(captured: Card[]): number {
  return captured.reduce((sum, card) => sum + getCardValue(card), 0);
}

function simulateTurn(
  playedCard: Card,
  currentField: Card[],
  remainingDeck: Card[]
): { captured: Card[]; newField: Card[] } {
  const handMatch = applyMatch(playedCard, currentField);

  let captured: Card[] = [];
  let fieldAfterHand: Card[];

  if (handMatch.requiresChoice && handMatch.matchingCards) {
    const bestMatch = handMatch.matchingCards.reduce((best, current) =>
      getCardValue(current) > getCardValue(best) ? current : best
    );
    captured = [playedCard, bestMatch];
    fieldAfterHand = currentField.filter(c => c.id !== bestMatch.id);
  } else {
    captured = handMatch.captured;
    fieldAfterHand = handMatch.remainingField;
  }

  if (remainingDeck.length === 0) {
    return { captured, newField: fieldAfterHand };
  }

  const deckCard = remainingDeck[0];
  const deckMatch = applyMatch(deckCard, fieldAfterHand);

  if (deckMatch.requiresChoice && deckMatch.matchingCards) {
    const bestMatch = deckMatch.matchingCards.reduce((best, current) =>
      getCardValue(current) > getCardValue(best) ? current : best
    );
    captured = [...captured, deckCard, bestMatch];
    return {
      captured,
      newField: fieldAfterHand.filter(c => c.id !== bestMatch.id),
    };
  }

  return {
    captured: [...captured, ...deckMatch.captured],
    newField: deckMatch.remainingField,
  };
}

export function calculateExpectedScore(
  _state: GameState,
  card: Card,
  hand: Card[],
  field: Card[],
  knownCards: Card[]
): number {
  const remainingCards = getRemainingCards(hand, field, knownCards);

  let totalScore = 0;

  for (let i = 0; i < MONTE_CARLO_SIMULATIONS; i++) {
    const sampledDeck = sampleCards(remainingCards, 2);
    const { captured } = simulateTurn(card, field, sampledDeck);
    totalScore += evaluateCapture(captured);
  }

  const immediateMatches = findMatchingCards(card, field);
  const matchBonus = immediateMatches.length > 0 ? 5 : 0;

  return (totalScore / MONTE_CARLO_SIMULATIONS) + matchBonus;
}

export function selectMove(
  state: GameState,
  hand: Card[],
  field: Card[],
  knownCards: Card[]
): Card {
  const validMoves = getValidMoves(hand, field);

  if (validMoves.length === 0) {
    return hand[0];
  }

  if (validMoves.length === 1) {
    return validMoves[0];
  }

  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const expectedScore = calculateExpectedScore(state, move, hand, field, knownCards);
    if (expectedScore > bestScore) {
      bestScore = expectedScore;
      bestMove = move;
    }
  }

  return bestMove;
}

export function selectGoStop(
  score: number,
  myScore: number,
  opponentScore: number,
  expectedScore: number
): 'go' | 'stop' {
  if (score < 7) {
    return 'go';
  }

  const lead = myScore - opponentScore;
  const expectedLead = expectedScore - opponentScore;

  if (expectedLead >= 5) {
    return 'stop';
  }

  if (lead >= 7) {
    return 'stop';
  }

  const winProbability = expectedScore / (expectedScore + opponentScore + 1);

  if (winProbability > 0.6) {
    return 'go';
  }

  if (lead >= 3 && score >= 10) {
    return 'stop';
  }

  return Math.random() > 0.5 ? 'go' : 'stop';
}
