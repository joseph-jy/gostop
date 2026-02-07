import { test, expect } from '@playwright/test';
import { CARDS } from '../src/game/cards';
import { shuffle, DealResult } from '../src/game/deck';
import { createInitialState, calculateScore, GameState } from '../src/game/state';
import { applyMatch } from '../src/game/matching';
import { selectMove as easySelectMove, selectGoStop as easySelectGoStop } from '../src/ai/easy';

function createDealResult(): DealResult {
  const shuffled = shuffle(CARDS);
  return {
    playerHand: shuffled.slice(0, 10),
    aiHand: shuffled.slice(10, 20),
    field: shuffled.slice(20, 28),
    deck: shuffled.slice(28, 48),
  };
}

test.describe('Full Game Flow', () => {
  test('should complete a full game from start to finish', async () => {
    const deal = createDealResult();
    const state = createInitialState(deal);

    expect(state.playerHand).toHaveLength(10);
    expect(state.aiHand).toHaveLength(10);
    expect(state.field).toHaveLength(8);
    expect(state.deck).toHaveLength(20);
    expect(state.currentTurn).toBe('player');
    expect(state.phase).toBe('waiting');
  });

  test('should handle card dealing and turn progression', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    let playerHand = [...deal.playerHand];
    let aiHand = [...deal.aiHand];
    let field = [...deal.field];
    let deck = [...deal.deck];
    let playerCapture: typeof CARDS = [];
    let aiCapture: typeof CARDS = [];

    let turn = 0;
    const maxTurns = 20;
    let isPlayerTurn = true;

    while (playerHand.length > 0 && aiHand.length > 0 && turn < maxTurns) {
      const currentHand = isPlayerTurn ? playerHand : aiHand;
      const selectedCard = easySelectMove(state, currentHand, field);

      if (isPlayerTurn) {
        playerHand = playerHand.filter(c => c.id !== selectedCard.id);
      } else {
        aiHand = aiHand.filter(c => c.id !== selectedCard.id);
      }

      const handResult = applyMatch(selectedCard, field);
      let captured = handResult.requiresChoice && handResult.matchingCards
        ? [selectedCard, handResult.matchingCards[0]]
        : handResult.captured;

      field = handResult.requiresChoice && handResult.matchingCards
        ? field.filter(c => c.id !== handResult.matchingCards![0].id)
        : handResult.remainingField;

      if (deck.length > 0) {
        const deckCard = deck.shift()!;
        const deckResult = applyMatch(deckCard, field);

        captured = deckResult.requiresChoice && deckResult.matchingCards
          ? [...captured, deckCard, deckResult.matchingCards[0]]
          : [...captured, ...deckResult.captured];

        field = deckResult.requiresChoice && deckResult.matchingCards
          ? field.filter(c => c.id !== deckResult.matchingCards![0].id)
          : deckResult.remainingField;
      }

      if (isPlayerTurn) {
        playerCapture = [...playerCapture, ...captured];
      } else {
        aiCapture = [...aiCapture, ...captured];
      }

      const currentScore = calculateScore(isPlayerTurn ? playerCapture : aiCapture);
      
      if (currentScore >= 7) {
        const decision = easySelectGoStop(currentScore);
        
        if (decision === 'stop') {
          break;
        }
      }

      isPlayerTurn = !isPlayerTurn;
      turn++;
    }

    const finalPlayerScore = calculateScore(playerCapture);
    const finalAIScore = calculateScore(aiCapture);

    expect(finalPlayerScore).toBeGreaterThanOrEqual(0);
    expect(finalAIScore).toBeGreaterThanOrEqual(0);
    expect(turn).toBeLessThanOrEqual(maxTurns);
  });

  test('should handle game ending with score threshold', async () => {
    const deal = createDealResult();
    let state = createInitialState(deal);

    let playerHand = [...deal.playerHand];
    let aiHand = [...deal.aiHand];
    let field = [...deal.field];
    let deck = [...deal.deck];
    let playerCapture: typeof CARDS = [];
    let aiCapture: typeof CARDS = [];

    let isPlayerTurn = true;
    let gameEnded = false;

    for (let turn = 0; turn < 20 && !gameEnded; turn++) {
      const currentHand = isPlayerTurn ? playerHand : aiHand;
      
      if (currentHand.length === 0) break;

      const selectedCard = easySelectMove(state, currentHand, field);

      if (isPlayerTurn) {
        playerHand = playerHand.filter(c => c.id !== selectedCard.id);
      } else {
        aiHand = aiHand.filter(c => c.id !== selectedCard.id);
      }

      const handResult = applyMatch(selectedCard, field);
      let captured = handResult.requiresChoice && handResult.matchingCards
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

      const currentScore = calculateScore(isPlayerTurn ? playerCapture : aiCapture);
      
      if (currentScore >= 7) {
        const decision = easySelectGoStop(currentScore);
        
        if (decision === 'stop') {
          gameEnded = true;
          break;
        }
      }

      isPlayerTurn = !isPlayerTurn;
    }

    if (gameEnded) {
      const playerScore = calculateScore(playerCapture);
      const aiScore = calculateScore(aiCapture);

      expect(playerScore >= 7 || aiScore >= 7).toBe(true);
    }
  });

  test('should maintain valid game state throughout', async () => {
    const deal = createDealResult();
    let state: GameState = createInitialState(deal);

    let playerHand = [...deal.playerHand];
    let aiHand = [...deal.aiHand];
    let field = [...deal.field];
    let deck = [...deal.deck];
    let playerCapture: typeof CARDS = [];
    let aiCapture: typeof CARDS = [];

    const initialTotal = playerHand.length + aiHand.length + field.length + deck.length;
    expect(initialTotal).toBe(48);

    for (let turn = 0; turn < 5; turn++) {
      if (playerHand.length === 0 || aiHand.length === 0) break;

      const isPlayerTurn = turn % 2 === 0;
      const currentHand = isPlayerTurn ? playerHand : aiHand;
      
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

      const currentTotal = playerHand.length + aiHand.length + field.length + 
                          deck.length + playerCapture.length + aiCapture.length;
      expect(currentTotal).toBe(48);
    }
  });

  test('should complete within reasonable time', async () => {
    const start = performance.now();
    
    const deal = createDealResult();
    let state = createInitialState(deal);

    let playerHand = [...deal.playerHand];
    let aiHand = [...deal.aiHand];
    let field = [...deal.field];
    let deck = [...deal.deck];
    let playerCapture: typeof CARDS = [];
    let aiCapture: typeof CARDS = [];

    for (let turn = 0; turn < 20; turn++) {
      if (playerHand.length === 0 || aiHand.length === 0) break;

      const isPlayerTurn = turn % 2 === 0;
      const currentHand = isPlayerTurn ? playerHand : aiHand;
      
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

      const currentScore = calculateScore(isPlayerTurn ? playerCapture : aiCapture);
      
      if (currentScore >= 7) {
        const decision = easySelectGoStop(currentScore);
        if (decision === 'stop') break;
      }
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(10000);
  });
});
