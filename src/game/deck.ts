import { Card, CARDS } from './cards';

export function createDeck(): Card[] {
  return [...CARDS];
}

export function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

export interface DealResult {
  playerHand: Card[];
  aiHand: Card[];
  field: Card[];
  deck: Card[];
}

export function dealCards(deck: Card[]): DealResult {
  const shuffled = shuffle(deck);
  
  return {
    playerHand: shuffled.slice(0, 10),
    aiHand: shuffled.slice(10, 20),
    field: shuffled.slice(20, 28),
    deck: shuffled.slice(28, 48),
  };
}
