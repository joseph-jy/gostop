import { describe, it, expect, beforeEach } from 'vitest';
import { selectMove, selectGoStop } from '../ai/easy';
import { Card, CardType, Month } from '../game/cards';
import { GameState } from '../game/state';
import { createMockGameState } from './test-helpers';

describe('Easy AI', () => {
  let mockState: GameState;
  let mockHand: Card[];
  let mockField: Card[];

  beforeEach(() => {
    mockState = createMockGameState({ phase: 'select-hand' });

    mockHand = [
      { id: 'test-1', month: Month.January, type: CardType.Pi, imagePath: 'test' },
      { id: 'test-2', month: Month.February, type: CardType.Pi, imagePath: 'test' },
      { id: 'test-3', month: Month.March, type: CardType.Pi, imagePath: 'test' },
    ];

    mockField = [
      { id: 'field-1', month: Month.April, type: CardType.Pi, imagePath: 'test' },
      { id: 'field-2', month: Month.May, type: CardType.Pi, imagePath: 'test' },
    ];
  });

  describe('selectMove', () => {
    it('should return a card from the hand', () => {
      const selectedCard = selectMove(mockState, mockHand, mockField, []);
      expect(selectedCard).toBeDefined();
      expect(mockHand).toContainEqual(selectedCard);
    });

    it('should return a valid move (card from hand)', () => {
      const selectedCard = selectMove(mockState, mockHand, mockField, []);
      const isInHand = mockHand.some((card) => card.id === selectedCard.id);
      expect(isInHand).toBe(true);
    });

    it('should return different cards on multiple calls (randomness)', () => {
      const results = new Set<string>();

      for (let i = 0; i < 20; i++) {
        const selectedCard = selectMove(mockState, mockHand, mockField, []);
        results.add(selectedCard.id);
      }

      expect(results.size).toBeGreaterThan(1);
    });

    it('should handle single card in hand', () => {
      const singleCardHand = [mockHand[0]];
      const selectedCard = selectMove(mockState, singleCardHand, mockField, []);
      expect(selectedCard.id).toBe(mockHand[0].id);
    });

    it('should respond in less than 100ms', () => {
      const start = performance.now();
      selectMove(mockState, mockHand, mockField, []);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });
  });

  describe('selectGoStop', () => {
    it('should return either "go" or "stop"', () => {
      const result = selectGoStop(10, 10, 5, 12);
      expect(['go', 'stop']).toContain(result);
    });

    it('should return "stop" approximately 70% of the time', () => {
      const iterations = 1000;
      let stopCount = 0;

      for (let i = 0; i < iterations; i++) {
        if (selectGoStop(10, 10, 5, 12) === 'stop') {
          stopCount++;
        }
      }

      const stopPercentage = stopCount / iterations;
      expect(stopPercentage).toBeGreaterThan(0.6);
      expect(stopPercentage).toBeLessThan(0.8);
    });

    it('should return "go" approximately 30% of the time', () => {
      const iterations = 1000;
      let goCount = 0;

      for (let i = 0; i < iterations; i++) {
        if (selectGoStop(10, 10, 5, 12) === 'go') {
          goCount++;
        }
      }

      const goPercentage = goCount / iterations;
      expect(goPercentage).toBeGreaterThan(0.2);
      expect(goPercentage).toBeLessThan(0.4);
    });

    it('should respond in less than 100ms', () => {
      const start = performance.now();
      selectGoStop(10, 10, 5, 12);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });

    it('should work with different score values', () => {
      const scores = [0, 5, 7, 10, 15, 20];

      scores.forEach((score) => {
        const result = selectGoStop(score, score, 5, 12);
        expect(['go', 'stop']).toContain(result);
      });
    });
  });
});
