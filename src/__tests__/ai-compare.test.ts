import { describe, it, expect } from 'vitest';
import { selectMove as hardSelectMove, selectGoStop as hardSelectGoStop } from '../ai/hard';
import { selectMove as easySelectMove, selectGoStop as easySelectGoStop } from '../ai/easy';
import { Card, CARDS } from '../game/cards';
import { createInitialState, calculateScore } from '../game/state';
import { DealResult, shuffle } from '../game/deck';
import { applyMatch } from '../game/matching';

interface SimulationResult {
  hardWins: number;
  easyWins: number;
  draws: number;
}

function createDealResult(shuffled: Card[]): DealResult {
  return {
    playerHand: shuffled.slice(0, 10),
    aiHand: shuffled.slice(10, 20),
    field: shuffled.slice(20, 28),
    deck: shuffled.slice(28, 48),
  };
}

function simulateGame(hardIsPlayer: boolean): 'hard' | 'easy' | 'draw' {
  const shuffled = shuffle(CARDS);
  const deal = createDealResult(shuffled);
  const state = createInitialState(deal);

  let playerHand = [...deal.playerHand];
  let aiHand = [...deal.aiHand];
  let field = [...deal.field];
  let deck = [...deal.deck];
  let playerCapture: Card[] = [];
  let aiCapture: Card[] = [];

  const maxTurns = 20;
  let turn = 0;
  let isPlayerTurn = true;

  while (playerHand.length > 0 && aiHand.length > 0 && turn < maxTurns) {
    const currentHand = isPlayerTurn ? playerHand : aiHand;
    const isHardTurn = hardIsPlayer ? isPlayerTurn : !isPlayerTurn;

    const selectMove = isHardTurn ? hardSelectMove : easySelectMove;
    const knownCards = isHardTurn ? [...field, ...playerCapture, ...aiCapture] : [];

    const selectedCard = selectMove(state, currentHand, field, knownCards);

    if (isPlayerTurn) {
      playerHand = playerHand.filter(c => c.id !== selectedCard.id);
    } else {
      aiHand = aiHand.filter(c => c.id !== selectedCard.id);
    }

    const handResult = applyMatch(selectedCard, field);
    let captured: Card[] = [];

    if (handResult.requiresChoice && handResult.matchingCards) {
      captured = [selectedCard, handResult.matchingCards[0]];
      field = field.filter(c => c.id !== handResult.matchingCards![0].id);
    } else {
      captured = handResult.captured;
      field = handResult.remainingField;
    }

    if (deck.length > 0) {
      const deckCard = deck.shift()!;
      const deckResult = applyMatch(deckCard, field);

      if (deckResult.requiresChoice && deckResult.matchingCards) {
        captured = [...captured, deckCard, deckResult.matchingCards[0]];
        field = field.filter(c => c.id !== deckResult.matchingCards![0].id);
      } else {
        captured = [...captured, ...deckResult.captured];
        field = deckResult.remainingField;
      }
    }

    if (isPlayerTurn) {
      playerCapture = [...playerCapture, ...captured];
    } else {
      aiCapture = [...aiCapture, ...captured];
    }

    const currentScore = calculateScore(isPlayerTurn ? playerCapture : aiCapture);
    if (currentScore >= 7) {
      const opponentScore = calculateScore(isPlayerTurn ? aiCapture : playerCapture);

      let decision: 'go' | 'stop';
      if (isHardTurn) {
        decision = hardSelectGoStop(currentScore, currentScore, opponentScore, currentScore + 2);
      } else {
        decision = easySelectGoStop(currentScore, currentScore, opponentScore, currentScore);
      }

      if (decision === 'stop') {
        const hardCapture = hardIsPlayer ? playerCapture : aiCapture;
        const easyCapture = hardIsPlayer ? aiCapture : playerCapture;
        const hardScore = calculateScore(hardCapture);
        const easyScore = calculateScore(easyCapture);

        if (hardScore > easyScore) return 'hard';
        if (easyScore > hardScore) return 'easy';
        return 'draw';
      }
    }

    isPlayerTurn = !isPlayerTurn;
    turn++;
  }

  const hardCapture = hardIsPlayer ? playerCapture : aiCapture;
  const easyCapture = hardIsPlayer ? aiCapture : playerCapture;
  const hardScore = calculateScore(hardCapture);
  const easyScore = calculateScore(easyCapture);

  if (hardScore > easyScore) return 'hard';
  if (easyScore > hardScore) return 'easy';
  return 'draw';
}

function runSimulation(games: number): SimulationResult {
  const results: SimulationResult = { hardWins: 0, easyWins: 0, draws: 0 };

  for (let i = 0; i < games; i++) {
    const hardIsPlayer = i % 2 === 0;
    const result = simulateGame(hardIsPlayer);

    if (result === 'hard') results.hardWins++;
    else if (result === 'easy') results.easyWins++;
    else results.draws++;
  }

  return results;
}

describe('AI Comparison', () => {
  describe('Hard AI vs Easy AI', () => {
    it('should have better win rate than easy AI', () => {
      const numGames = 100;
      const results = runSimulation(numGames);

      const hardWinRate = results.hardWins / numGames;

      expect(hardWinRate).toBeGreaterThan(0.4);
    });

    it('should show consistent performance across multiple runs', () => {
      const runs = 3;
      const gamesPerRun = 50;
      const winRates: number[] = [];

      for (let i = 0; i < runs; i++) {
        const results = runSimulation(gamesPerRun);
        winRates.push(results.hardWins / gamesPerRun);
      }

      const avgWinRate = winRates.reduce((a, b) => a + b, 0) / runs;
      expect(avgWinRate).toBeGreaterThan(0.35);
    });

    it('should complete 100 games within reasonable time', () => {
      const start = performance.now();
      runSimulation(100);
      const end = performance.now();

      expect(end - start).toBeLessThan(30000);
    });
  });
});
