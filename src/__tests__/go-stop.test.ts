import { describe, it, expect } from 'vitest';
import {
  canGoOrStop,
  selectGo,
  selectStop,
  calculateGoMultiplier,
  handleReversal,
} from '../game/go-stop';
import { GameState } from '../game/state';
import { Card, CardType, Month } from '../game/cards';

function createTestCard(id: string, month: Month, type: CardType): Card {
  return { id, month, type, imagePath: `cards/${id}.png` };
}

function createTestState(overrides?: Partial<GameState>): GameState {
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
    ...overrides,
  };
}

describe('canGoOrStop', () => {
  it('should return true when score is exactly 7', () => {
    expect(canGoOrStop(7)).toBe(true);
  });

  it('should return true when score is greater than 7', () => {
    expect(canGoOrStop(10)).toBe(true);
    expect(canGoOrStop(15)).toBe(true);
  });

  it('should return false when score is less than 7', () => {
    expect(canGoOrStop(6)).toBe(false);
    expect(canGoOrStop(0)).toBe(false);
    expect(canGoOrStop(3)).toBe(false);
  });
});

describe('selectGo', () => {
  it('should increment player goCount when player selects go', () => {
    const state = createTestState({
      currentTurn: 'player',
      goCount: { player: 0, ai: 0 },
    });

    const newState = selectGo(state);

    expect(newState.goCount.player).toBe(1);
    expect(newState.goCount.ai).toBe(0);
  });

  it('should increment ai goCount when ai selects go', () => {
    const state = createTestState({
      currentTurn: 'ai',
      goCount: { player: 0, ai: 0 },
    });

    const newState = selectGo(state);

    expect(newState.goCount.player).toBe(0);
    expect(newState.goCount.ai).toBe(1);
  });

  it('should switch turn after selecting go', () => {
    const state = createTestState({
      currentTurn: 'player',
    });

    const newState = selectGo(state);

    expect(newState.currentTurn).toBe('ai');
  });

  it('should set phase to select-hand after selecting go', () => {
    const state = createTestState({
      phase: 'go-stop',
    });

    const newState = selectGo(state);

    expect(newState.phase).toBe('select-hand');
  });

  it('should reset selectedCard and flippedCard after selecting go', () => {
    const testCard = createTestCard('january-gwang', Month.January, CardType.Gwang);
    const state = createTestState({
      selectedCard: testCard,
      flippedCard: testCard,
    });

    const newState = selectGo(state);

    expect(newState.selectedCard).toBeNull();
    expect(newState.flippedCard).toBeNull();
  });

  it('should not mutate original state', () => {
    const state = createTestState({
      currentTurn: 'player',
      goCount: { player: 0, ai: 0 },
    });

    const originalGoCount = state.goCount.player;
    selectGo(state);

    expect(state.goCount.player).toBe(originalGoCount);
  });

  it('should increment goCount multiple times', () => {
    let state = createTestState({
      currentTurn: 'player',
      goCount: { player: 0, ai: 0 },
    });

    state = selectGo(state);
    expect(state.goCount.player).toBe(1);

    state = createTestState({
      ...state,
      currentTurn: 'player',
    });
    state = selectGo(state);
    expect(state.goCount.player).toBe(2);

    state = createTestState({
      ...state,
      currentTurn: 'player',
    });
    state = selectGo(state);
    expect(state.goCount.player).toBe(3);
  });
});

describe('selectStop', () => {
  it('should set phase to end when stop is selected', () => {
    const state = createTestState({
      phase: 'go-stop',
    });

    const newState = selectStop(state);

    expect(newState.phase).toBe('end');
  });

  it('should not change scores when stop is selected', () => {
    const playerCapture = [
      createTestCard('january-gwang', Month.January, CardType.Gwang),
      createTestCard('march-gwang', Month.March, CardType.Gwang),
      createTestCard('august-gwang', Month.August, CardType.Gwang),
    ];

    const state = createTestState({
      playerCapture,
    });

    const newState = selectStop(state);

    expect(newState.playerCapture).toEqual(playerCapture);
  });

  it('should not mutate original state', () => {
    const state = createTestState({
      phase: 'go-stop',
    });

    const originalPhase = state.phase;
    selectStop(state);

    expect(state.phase).toBe(originalPhase);
  });
});

describe('calculateGoMultiplier', () => {
  it('should return 1 when goCount is 0', () => {
    expect(calculateGoMultiplier(0)).toBe(1);
  });

  it('should return 2 when goCount is 1', () => {
    expect(calculateGoMultiplier(1)).toBe(2);
  });

  it('should return 4 when goCount is 2', () => {
    expect(calculateGoMultiplier(2)).toBe(4);
  });

  it('should return 8 when goCount is 3', () => {
    expect(calculateGoMultiplier(3)).toBe(8);
  });

  it('should return 16 when goCount is 4', () => {
    expect(calculateGoMultiplier(4)).toBe(16);
  });

  it('should handle large goCount values', () => {
    expect(calculateGoMultiplier(10)).toBe(1024);
  });
});

describe('handleReversal', () => {
  it('should calculate reversal penalty correctly', () => {
    const state = createTestState({
      currentTurn: 'player',
      goCount: { player: 2, ai: 0 },
    });

    const playerScore = 10;
    const opponentGo = 0;

    handleReversal(state, playerScore, opponentGo);

    const penalty = playerScore * calculateGoMultiplier(2);
    expect(penalty).toBe(40);
  });

  it('should transfer penalty from player to ai when player declared go', () => {
    const state = createTestState({
      currentTurn: 'player',
      goCount: { player: 1, ai: 0 },
    });

    const playerScore = 8;
    const opponentGo = 0;

    handleReversal(state, playerScore, opponentGo);

    const penalty = playerScore * calculateGoMultiplier(1);
    expect(penalty).toBe(16);
  });

  it('should handle reversal with multiple go declarations', () => {
    const state = createTestState({
      currentTurn: 'player',
      goCount: { player: 3, ai: 0 },
    });

    const playerScore = 7;
    const opponentGo = 0;

    handleReversal(state, playerScore, opponentGo);

    const penalty = playerScore * calculateGoMultiplier(3);
    expect(penalty).toBe(56);
  });

  it('should handle reversal when opponent also declared go', () => {
    const state = createTestState({
      currentTurn: 'player',
      goCount: { player: 2, ai: 1 },
    });

    const playerScore = 10;
    const opponentGo = 1;

    handleReversal(state, playerScore, opponentGo);

    const playerPenalty = playerScore * calculateGoMultiplier(2);
    const opponentMultiplier = calculateGoMultiplier(1);
    expect(playerPenalty).toBe(40);
    expect(opponentMultiplier).toBe(2);
  });

  it('should not mutate original state', () => {
    const state = createTestState({
      currentTurn: 'player',
      goCount: { player: 1, ai: 0 },
    });

    const originalGoCount = state.goCount.player;
    handleReversal(state, 10, 0);

    expect(state.goCount.player).toBe(originalGoCount);
  });

  it('should handle zero score reversal', () => {
    const state = createTestState({
      currentTurn: 'player',
      goCount: { player: 2, ai: 0 },
    });

    const playerScore = 0;
    const opponentGo = 0;

    handleReversal(state, playerScore, opponentGo);

    const penalty = playerScore * calculateGoMultiplier(2);
    expect(penalty).toBe(0);
  });
});
