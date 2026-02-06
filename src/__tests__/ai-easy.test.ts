import { describe, it, expect, beforeEach } from 'vitest';
import { selectMove, selectGoStop } from '../ai/easy';
import { Card, CardType, Month } from '../game/cards';
import { GameState, createInitialState } from '../game/state';
import { dealCards, createDeck } from '../game/deck';

describe('Easy AI', () => {
  let mockState: GameState;
  let mockHand: Card[];
  let mockField: Card[];

  beforeEach(() => {
    // Create a simple mock state
    const dealResult = dealCards(createDeck());
    mockState = createInitialState(dealResult);
    
    // Create mock hand with 3 cards
    mockHand = [
      { id: 'test-1', month: Month.January, type: CardType.Pi, imagePath: 'test' },
      { id: 'test-2', month: Month.February, type: CardType.Pi, imagePath: 'test' },
      { id: 'test-3', month: Month.March, type: CardType.Pi, imagePath: 'test' },
    ];

    // Create mock field with 2 cards
    mockField = [
      { id: 'field-1', month: Month.April, type: CardType.Pi, imagePath: 'test' },
      { id: 'field-2', month: Month.May, type: CardType.Pi, imagePath: 'test' },
    ];
  });

  describe('selectMove', () => {
    it('should return a card from the hand', () => {
      const selectedCard = selectMove(mockState, mockHand, mockField);
      expect(selectedCard).toBeDefined();
      expect(mockHand).toContainEqual(selectedCard);
    });

    it('should return a valid move (card from hand)', () => {
      const selectedCard = selectMove(mockState, mockHand, mockField);
      const isInHand = mockHand.some((card) => card.id === selectedCard.id);
      expect(isInHand).toBe(true);
    });

    it('should return different cards on multiple calls (randomness)', () => {
      const results = new Set<string>();
      
      // Call selectMove multiple times to check for randomness
      for (let i = 0; i < 20; i++) {
        const selectedCard = selectMove(mockState, mockHand, mockField);
        results.add(selectedCard.id);
      }

      // With 3 cards and 20 calls, we should get at least 2 different cards
      // (probability of getting same card 20 times is extremely low)
      expect(results.size).toBeGreaterThan(1);
    });

    it('should handle single card in hand', () => {
      const singleCardHand = [mockHand[0]];
      const selectedCard = selectMove(mockState, singleCardHand, mockField);
      expect(selectedCard.id).toBe(mockHand[0].id);
    });

    it('should respond in less than 100ms', () => {
      const start = performance.now();
      selectMove(mockState, mockHand, mockField);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('selectGoStop', () => {
    it('should return either "go" or "stop"', () => {
      const result = selectGoStop(10);
      expect(['go', 'stop']).toContain(result);
    });

    it('should return "stop" approximately 70% of the time', () => {
      const iterations = 1000;
      let stopCount = 0;

      for (let i = 0; i < iterations; i++) {
        if (selectGoStop(10) === 'stop') {
          stopCount++;
        }
      }

      const stopPercentage = stopCount / iterations;
      // Allow 10% margin (60-80% instead of 70%)
      expect(stopPercentage).toBeGreaterThan(0.6);
      expect(stopPercentage).toBeLessThan(0.8);
    });

    it('should return "go" approximately 30% of the time', () => {
      const iterations = 1000;
      let goCount = 0;

      for (let i = 0; i < iterations; i++) {
        if (selectGoStop(10) === 'go') {
          goCount++;
        }
      }

      const goPercentage = goCount / iterations;
      // Allow 10% margin (20-40% instead of 30%)
      expect(goPercentage).toBeGreaterThan(0.2);
      expect(goPercentage).toBeLessThan(0.4);
    });

    it('should respond in less than 100ms', () => {
      const start = performance.now();
      selectGoStop(10);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100);
    });

    it('should work with different score values', () => {
      const scores = [0, 5, 7, 10, 15, 20];
      
      scores.forEach((score) => {
        const result = selectGoStop(score);
        expect(['go', 'stop']).toContain(result);
      });
    });
  });
});
