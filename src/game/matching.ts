import { Card } from './cards';

export interface MatchResult {
  captured: Card[];
  remainingField: Card[];
  requiresChoice?: boolean;
  matchingCards?: Card[];
}

export function findMatchingCards(card: Card, field: Card[]): Card[] {
  return field.filter((fieldCard) => fieldCard.month === card.month);
}

export function getValidMoves(hand: Card[], _field: Card[]): Card[] {
  return [...hand];
}

export function applyMatch(card: Card, field: Card[]): MatchResult {
  const matchingCards = findMatchingCards(card, field);

  if (matchingCards.length === 0) {
    return {
      captured: [],
      remainingField: [...field, card],
    };
  }

  if (matchingCards.length === 1) {
    const matchedCard = matchingCards[0];
    return {
      captured: [card, matchedCard],
      remainingField: field.filter((f) => f.id !== matchedCard.id),
    };
  }

  return {
    captured: [],
    remainingField: field,
    requiresChoice: true,
    matchingCards,
  };
}
