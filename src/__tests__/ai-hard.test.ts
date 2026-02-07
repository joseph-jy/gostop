import { describe, it, expect, beforeEach } from 'vitest';
import {
  selectMove,
  selectGoStop,
  calculateExpectedScore,
} from '../ai/hard';
import { Card, CardType, Month, CARDS } from '../game/cards';
import { GameState } from '../game/state';
import { dealCards } from '../game/deck';
import { createMockGameState } from './test-helpers';

describe('Hard AI', () => {
  let mockState: GameState;
  let mockHand: Card[];
  let mockField: Card[];

  beforeEach(() => {
    const dealResult = dealCards(CARDS);
    mockState = createMockGameState({
      playerHand: dealResult.playerHand,
      aiHand: dealResult.aiHand,
      field: dealResult.field,
      deck: dealResult.deck,
      phase: 'select-hand',
    });

    mockHand = [
      { id: 'january-gwang', month: Month.January, type: CardType.Gwang, imagePath: 'test' },
      { id: 'february-yeol', month: Month.February, type: CardType.Yeol, imagePath: 'test' },
      { id: 'march-pi-1', month: Month.March, type: CardType.Pi, imagePath: 'test' },
    ];

    mockField = [
      { id: 'january-tti', month: Month.January, type: CardType.Tti, imagePath: 'test' },
      { id: 'april-pi-1', month: Month.April, type: CardType.Pi, imagePath: 'test' },
    ];
  });

  describe('calculateExpectedScore', () => {
    it('should return a number', () => {
      const card = mockHand[0];
      const result = calculateExpectedScore(mockState, card, mockHand, mockField, []);
      expect(typeof result).toBe('number');
    });

    it('should return higher score for gwang capture', () => {
      const gwangCard = mockHand[0]; // january-gwang
      const piCard = mockHand[2]; // march-pi-1

      const gwangScore = calculateExpectedScore(mockState, gwangCard, mockHand, mockField, []);
      const piScore = calculateExpectedScore(mockState, piCard, mockHand, mockField, []);

      expect(gwangScore).toBeGreaterThanOrEqual(piScore);
    });

    it('should return higher score for card that matches field', () => {
      const matchingCard = mockHand[0]; // january-gwang matches january-tti on field
      const nonMatchingCard = mockHand[2]; // march-pi-1 has no match

      const matchingScore = calculateExpectedScore(mockState, matchingCard, mockHand, mockField, []);
      const nonMatchingScore = calculateExpectedScore(mockState, nonMatchingCard, mockHand, mockField, []);

      expect(matchingScore).toBeGreaterThan(nonMatchingScore);
    });

    it('should consider known cards when calculating', () => {
      const knownCards = [
        { id: 'january-pi-1', month: Month.January, type: CardType.Pi, imagePath: 'test' },
        { id: 'january-pi-2', month: Month.January, type: CardType.Pi, imagePath: 'test' },
      ];

      const score1 = calculateExpectedScore(mockState, mockHand[0], mockHand, mockField, []);
      const score2 = calculateExpectedScore(mockState, mockHand[0], mockHand, mockField, knownCards);

      expect(typeof score1).toBe('number');
      expect(typeof score2).toBe('number');
    });

    it('should complete calculation within reasonable time', () => {
      const start = performance.now();
      calculateExpectedScore(mockState, mockHand[0], mockHand, mockField, []);
      const end = performance.now();

      expect(end - start).toBeLessThan(500);
    });
  });

  describe('selectMove', () => {
    it('should return a card from the hand', () => {
      const selectedCard = selectMove(mockState, mockHand, mockField, []);
      expect(selectedCard).toBeDefined();
      expect(mockHand).toContainEqual(selectedCard);
    });

    it('should return a valid move', () => {
      const selectedCard = selectMove(mockState, mockHand, mockField, []);
      const isInHand = mockHand.some((card) => card.id === selectedCard.id);
      expect(isInHand).toBe(true);
    });

    it('should prefer gwang capture when possible', () => {
      const handWithGwang: Card[] = [
        { id: 'january-gwang', month: Month.January, type: CardType.Gwang, imagePath: 'test' },
        { id: 'may-pi-1', month: Month.May, type: CardType.Pi, imagePath: 'test' },
        { id: 'june-pi-1', month: Month.June, type: CardType.Pi, imagePath: 'test' },
      ];

      const fieldWithMatch: Card[] = [
        { id: 'january-tti', month: Month.January, type: CardType.Tti, imagePath: 'test' },
        { id: 'july-pi-1', month: Month.July, type: CardType.Pi, imagePath: 'test' },
      ];

      let gwangCount = 0;
      for (let i = 0; i < 10; i++) {
        const selectedCard = selectMove(mockState, handWithGwang, fieldWithMatch, []);
        if (selectedCard.id === 'january-gwang') {
          gwangCount++;
        }
      }

      expect(gwangCount).toBeGreaterThan(5);
    });

    it('should handle single card in hand', () => {
      const singleCardHand = [mockHand[0]];
      const selectedCard = selectMove(mockState, singleCardHand, mockField, []);
      expect(selectedCard.id).toBe(mockHand[0].id);
    });

    it('should respond in less than 1000ms', () => {
      const start = performance.now();
      selectMove(mockState, mockHand, mockField, []);
      const end = performance.now();

      expect(end - start).toBeLessThan(1000);
    });

    it('should handle larger hand within time limit', () => {
      const largerHand: Card[] = [
        { id: 'january-gwang', month: Month.January, type: CardType.Gwang, imagePath: 'test' },
        { id: 'february-yeol', month: Month.February, type: CardType.Yeol, imagePath: 'test' },
        { id: 'march-gwang', month: Month.March, type: CardType.Gwang, imagePath: 'test' },
        { id: 'april-yeol', month: Month.April, type: CardType.Yeol, imagePath: 'test' },
        { id: 'may-tti', month: Month.May, type: CardType.Tti, imagePath: 'test' },
        { id: 'june-tti', month: Month.June, type: CardType.Tti, imagePath: 'test' },
        { id: 'july-pi-1', month: Month.July, type: CardType.Pi, imagePath: 'test' },
        { id: 'august-gwang', month: Month.August, type: CardType.Gwang, imagePath: 'test' },
      ];

      const largerField: Card[] = [
        { id: 'january-tti', month: Month.January, type: CardType.Tti, imagePath: 'test' },
        { id: 'september-tti', month: Month.September, type: CardType.Tti, imagePath: 'test' },
        { id: 'october-pi-1', month: Month.October, type: CardType.Pi, imagePath: 'test' },
        { id: 'november-pi', month: Month.November, type: CardType.Pi, imagePath: 'test' },
      ];

      const start = performance.now();
      const selectedCard = selectMove(mockState, largerHand, largerField, []);
      const end = performance.now();

      expect(selectedCard).toBeDefined();
      expect(end - start).toBeLessThan(2000);
    });
  });

  describe('selectGoStop', () => {
    it('should return either "go" or "stop"', () => {
      const result = selectGoStop(10, 10, 5, 12);
      expect(['go', 'stop']).toContain(result);
    });

    it('should stop when score is high and lead is safe', () => {
      const result = selectGoStop(10, 10, 3, 12);
      expect(result).toBe('stop');
    });

    it('should go when score is low (< 7)', () => {
      const results: string[] = [];
      for (let i = 0; i < 10; i++) {
        results.push(selectGoStop(5, 5, 3, 8));
      }
      const goCount = results.filter(r => r === 'go').length;
      expect(goCount).toBeGreaterThan(5);
    });

    it('should stop when expected score is significantly higher than opponent', () => {
      const result = selectGoStop(10, 10, 4, 15);
      expect(result).toBe('stop');
    });

    it('should consider going when opponent is close', () => {
      const results: string[] = [];
      for (let i = 0; i < 20; i++) {
        results.push(selectGoStop(8, 8, 7, 9));
      }
      expect(results).toContain('go');
    });

    it('should respond in less than 100ms', () => {
      const start = performance.now();
      selectGoStop(10, 10, 5, 12);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });

    it('should work with various score combinations', () => {
      const testCases = [
        { score: 7, myScore: 7, oppScore: 0, expected: 10 },
        { score: 10, myScore: 10, oppScore: 5, expected: 12 },
        { score: 15, myScore: 15, oppScore: 10, expected: 18 },
        { score: 20, myScore: 20, oppScore: 15, expected: 22 },
      ];

      testCases.forEach(({ score, myScore, oppScore, expected }) => {
        const result = selectGoStop(score, myScore, oppScore, expected);
        expect(['go', 'stop']).toContain(result);
      });
    });
  });
});
