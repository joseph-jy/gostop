import { Card, CardType, Month } from '../game/cards';
import { GameState } from '../game/state';

export function createCard(id: string, month: Month, type: CardType): Card {
  return { id, month, type, imagePath: `cards/${id}.png` };
}

export function createMockGameState(overrides?: Partial<GameState>): GameState {
  return {
    playerHand: [],
    aiHand: [],
    field: [],
    deck: [],
    playerCapture: [],
    aiCapture: [],
    currentTurn: 'player',
    phase: 'check-score',
    goCount: { player: 0, ai: 0 },
    selectedCard: null,
    flippedCard: null,
    lastAction: null,
    shakingMultiplier: 1,
    pendingHandMatch: null,
    choiceContext: null,
    ...overrides,
  };
}
