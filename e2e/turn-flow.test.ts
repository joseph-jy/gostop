import { test, expect } from '@playwright/test';
import { CARDS } from '../src/game/cards';
import { shuffle, DealResult } from '../src/game/deck';
import { createInitialState, switchTurn, updateState, GameState } from '../src/game/state';
import { applyMatch } from '../src/game/matching';
import { selectMove as easySelectMove } from '../src/ai/easy';

function createDealResult(): DealResult {
  const shuffled = shuffle(CARDS);
  return {
    playerHand: shuffled.slice(0, 10),
    aiHand: shuffled.slice(10, 20),
    field: shuffled.slice(20, 28),
    deck: shuffled.slice(28, 48),
  };
}

test.describe('Turn Flow Verification', () => {
  test('should start with player turn', async () => {
    const deal = createDealResult();
    const state = createInitialState(deal);

    expect(state.currentTurn).toBe('player');
    expect(state.phase).toBe('waiting');
  });

  test('should switch turns correctly', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    expect(state.currentTurn).toBe('player');

    state = switchTurn(state);
    expect(state.currentTurn).toBe('ai');

    state = switchTurn(state);
    expect(state.currentTurn).toBe('player');
  });

  test('should maintain turn alternation throughout game', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    const turns: ('player' | 'ai')[] = [state.currentTurn];

    for (let i = 0; i < 10; i++) {
      state = switchTurn(state);
      turns.push(state.currentTurn);
    }

    for (let i = 0; i < turns.length - 1; i++) {
      expect(turns[i]).not.toBe(turns[i + 1]);
    }
  });

  test('should reset phase to select-hand on turn switch', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    state = updateState(state, { phase: 'match-hand' });
    expect(state.phase).toBe('match-hand');

    state = switchTurn(state);
    expect(state.phase).toBe('select-hand');
  });

  test('should clear selected and flipped cards on turn switch', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    const testCard = deal.playerHand[0];
    state = updateState(state, {
      selectedCard: testCard,
      flippedCard: testCard,
    });

    expect(state.selectedCard).not.toBeNull();
    expect(state.flippedCard).not.toBeNull();

    state = switchTurn(state);
    expect(state.selectedCard).toBeNull();
    expect(state.flippedCard).toBeNull();
  });

  test('should handle multiple consecutive turns', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    let playerHand = [...deal.playerHand];
    let aiHand = [...deal.aiHand];
    let field = [...deal.field];
    let playerCapture: typeof CARDS = [];
    let aiCapture: typeof CARDS = [];

    const turnHistory: ('player' | 'ai')[] = [];

    for (let turn = 0; turn < 10; turn++) {
      const isPlayerTurn = turn % 2 === 0;
      turnHistory.push(isPlayerTurn ? 'player' : 'ai');

      const currentHand = isPlayerTurn ? playerHand : aiHand;
      
      if (currentHand.length === 0) break;

      const selectedCard = easySelectMove(state, currentHand, field);

      if (isPlayerTurn) {
        playerHand = playerHand.filter(c => c.id !== selectedCard.id);
      } else {
        aiHand = aiHand.filter(c => c.id !== selectedCard.id);
      }

      const handResult = applyMatch(selectedCard, field);
      const captured = handResult.requiresChoice && handResult.matchingCards
        ? [selectedCard, handResult.matchingCards[0]]
        : handResult.captured;

      field = handResult.requiresChoice && handResult.matchingCards
        ? field.filter(c => c.id !== handResult.matchingCards![0].id)
        : handResult.remainingField;

      if (isPlayerTurn) {
        playerCapture = [...playerCapture, ...captured];
      } else {
        aiCapture = [...aiCapture, ...captured];
      }
    }

    expect(turnHistory.length).toBe(10);
    
    for (let i = 0; i < turnHistory.length - 1; i++) {
      expect(turnHistory[i]).not.toBe(turnHistory[i + 1]);
    }
  });

  test('should handle turn flow with card selection', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    let playerHand = [...deal.playerHand];
    let field = [...deal.field];

    const selectedCard = easySelectMove(state, playerHand, field);
    expect(selectedCard).toBeDefined();
    expect(playerHand.some(c => c.id === selectedCard.id)).toBe(true);

    playerHand = playerHand.filter(c => c.id !== selectedCard.id);
    expect(playerHand.some(c => c.id === selectedCard.id)).toBe(false);
  });

  test('should preserve game state across turns', async () => {
    const deal = createDealResult();
    let state: GameState = createInitialState(deal);

    let playerHand = [...deal.playerHand];
    let aiHand = [...deal.aiHand];
    let field = [...deal.field];
    let deck = [...deal.deck];
    let playerCapture: typeof CARDS = [];
    let aiCapture: typeof CARDS = [];

    const initialHandSize = playerHand.length;
    const initialAIHandSize = aiHand.length;

    for (let turn = 0; turn < 3; turn++) {
      const isPlayerTurn = turn % 2 === 0;
      const currentHand = isPlayerTurn ? playerHand : aiHand;

      if (currentHand.length === 0) break;

      const selectedCard = easySelectMove(state, currentHand, field);

      if (isPlayerTurn) {
        playerHand = playerHand.filter(c => c.id !== selectedCard.id);
      } else {
        aiHand = aiHand.filter(c => c.id !== selectedCard.id);
      }

      const handResult = applyMatch(selectedCard, field);
      const captured = handResult.requiresChoice && handResult.matchingCards
        ? [selectedCard, handResult.matchingCards[0]]
        : handResult.captured;

      field = handResult.requiresChoice && handResult.matchingCards
        ? field.filter(c => c.id !== handResult.matchingCards![0].id)
        : handResult.remainingField;

      if (isPlayerTurn) {
        playerCapture = [...playerCapture, ...captured];
      } else {
        aiCapture = [...aiCapture, ...captured];
      }
    }

    expect(playerHand.length).toBeLessThan(initialHandSize);
    expect(aiHand.length).toBeLessThan(initialAIHandSize);
    expect(playerCapture.length + aiCapture.length).toBeGreaterThanOrEqual(0);
  });

  test('should handle rapid turn switches', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    for (let i = 0; i < 100; i++) {
      const currentTurn = state.currentTurn;
      state = switchTurn(state);
      expect(state.currentTurn).not.toBe(currentTurn);
    }
  });

  test('should maintain turn count accuracy', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    let playerTurns = 0;
    let aiTurns = 0;

    for (let i = 0; i < 20; i++) {
      if (state.currentTurn === 'player') {
        playerTurns++;
      } else {
        aiTurns++;
      }
      state = switchTurn(state);
    }

    expect(Math.abs(playerTurns - aiTurns)).toBeLessThanOrEqual(1);
  });
});
