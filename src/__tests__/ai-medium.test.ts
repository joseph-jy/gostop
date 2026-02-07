import { describe, it, expect } from 'vitest';
import { selectMove, selectGoStop } from '../ai/medium';
import { Card, CardType, Month } from '../game/cards';
import { GameState } from '../game/state';

describe('Medium AI', () => {
  describe('selectMove', () => {
    it('should prioritize gwang cards when available on field', () => {
      const hand: Card[] = [
        { id: 'january-gwang', month: Month.January, type: CardType.Gwang, imagePath: '' },
        { id: 'february-pi-1', month: Month.February, type: CardType.Pi, imagePath: '' },
      ];
      
      const field: Card[] = [
        { id: 'january-tti', month: Month.January, type: CardType.Tti, imagePath: '' },
        { id: 'march-pi-1', month: Month.March, type: CardType.Pi, imagePath: '' },
      ];
      
      const state: GameState = {
        playerHand: [],
        aiHand: hand,
        field,
        deck: [],
        playerCapture: [],
        aiCapture: [],
        currentTurn: 'ai',
        phase: 'select-hand',
        goCount: { player: 0, ai: 0 },
        selectedCard: null,
        flippedCard: null,
        lastAction: null,
        shakingMultiplier: 1,
      };
      
      const selected = selectMove(state, hand, field);
      
      // Should select gwang card because it can match with field
      expect(selected.id).toBe('january-gwang');
      expect(selected.type).toBe(CardType.Gwang);
    });

    it('should prioritize combo completion (godori)', () => {
      const hand: Card[] = [
        { id: 'august-animal', month: Month.August, type: CardType.Yeol, imagePath: '' },
        { id: 'may-pi-1', month: Month.May, type: CardType.Pi, imagePath: '' },
      ];

      const field: Card[] = [
        { id: 'august-pi-1', month: Month.August, type: CardType.Pi, imagePath: '' },
        { id: 'may-hongdan', month: Month.May, type: CardType.Tti, imagePath: '' },
      ];

      const state: GameState = {
        playerHand: [],
        aiHand: hand,
        field,
        deck: [],
        playerCapture: [
          { id: 'february-bird', month: Month.February, type: CardType.Yeol, imagePath: '' },
          { id: 'april-bird', month: Month.April, type: CardType.Yeol, imagePath: '' },
        ],
        aiCapture: [
          { id: 'february-bird', month: Month.February, type: CardType.Yeol, imagePath: '' },
          { id: 'april-bird', month: Month.April, type: CardType.Yeol, imagePath: '' },
        ],
        currentTurn: 'ai',
        phase: 'select-hand',
        goCount: { player: 0, ai: 0 },
        selectedCard: null,
        flippedCard: null,
        lastAction: null,
        shakingMultiplier: 1,
      };

      const selected = selectMove(state, hand, field);

      // Should select august-animal to complete godori
      expect(selected.id).toBe('august-animal');
    });

    it('should prioritize combo completion (hongdan)', () => {
      const hand: Card[] = [
        { id: 'march-hongdan', month: Month.March, type: CardType.Tti, imagePath: '' },
        { id: 'june-pi-1', month: Month.June, type: CardType.Pi, imagePath: '' },
      ];

      const field: Card[] = [
        { id: 'march-pi-1', month: Month.March, type: CardType.Pi, imagePath: '' },
        { id: 'june-cheongdan', month: Month.June, type: CardType.Tti, imagePath: '' },
      ];

      const state: GameState = {
        playerHand: [],
        aiHand: hand,
        field,
        deck: [],
        playerCapture: [],
        aiCapture: [
          { id: 'january-hongdan', month: Month.January, type: CardType.Tti, imagePath: '' },
          { id: 'february-hongdan', month: Month.February, type: CardType.Tti, imagePath: '' },
        ],
        currentTurn: 'ai',
        phase: 'select-hand',
        goCount: { player: 0, ai: 0 },
        selectedCard: null,
        flippedCard: null,
        lastAction: null,
        shakingMultiplier: 1,
      };

      const selected = selectMove(state, hand, field);

      // Should select march-hongdan to complete hongdan
      expect(selected.id).toBe('march-hongdan');
    });

    it('should fall back to random selection when no priority moves', () => {
      const hand: Card[] = [
        { id: 'may-pi-1', month: Month.May, type: CardType.Pi, imagePath: '' },
        { id: 'june-pi-1', month: Month.June, type: CardType.Pi, imagePath: '' },
      ];
      
      const field: Card[] = [
        { id: 'january-tti', month: Month.January, type: CardType.Tti, imagePath: '' },
        { id: 'february-tti', month: Month.February, type: CardType.Tti, imagePath: '' },
      ];
      
      const state: GameState = {
        playerHand: [],
        aiHand: hand,
        field,
        deck: [],
        playerCapture: [],
        aiCapture: [],
        currentTurn: 'ai',
        phase: 'select-hand',
        goCount: { player: 0, ai: 0 },
        selectedCard: null,
        flippedCard: null,
        lastAction: null,
        shakingMultiplier: 1,
      };
      
      const selected = selectMove(state, hand, field);
      
      // Should select one of the cards from hand
      expect(hand.some(c => c.id === selected.id)).toBe(true);
    });

    it('should respond within 500ms', () => {
      const hand: Card[] = [
        { id: 'may-pi-1', month: Month.May, type: CardType.Pi, imagePath: '' },
        { id: 'june-pi-1', month: Month.June, type: CardType.Pi, imagePath: '' },
      ];
      
      const field: Card[] = [
        { id: 'january-tti', month: Month.January, type: CardType.Tti, imagePath: '' },
      ];
      
      const state: GameState = {
        playerHand: [],
        aiHand: hand,
        field,
        deck: [],
        playerCapture: [],
        aiCapture: [],
        currentTurn: 'ai',
        phase: 'select-hand',
        goCount: { player: 0, ai: 0 },
        selectedCard: null,
        flippedCard: null,
        lastAction: null,
        shakingMultiplier: 1,
      };
      
      const start = Date.now();
      selectMove(state, hand, field);
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('selectGoStop', () => {
    it('should stop when leading by 10+ points', () => {
      const decision = selectGoStop(8, 15, 5);
      
      // myScore (15) - opponentScore (5) = 10, should stop
      expect(decision).toBe('stop');
    });

    it('should stop when leading by more than 10 points', () => {
      const decision = selectGoStop(10, 20, 5);
      
      // myScore (20) - opponentScore (5) = 15, should stop
      expect(decision).toBe('stop');
    });

    it('should go when score is less than 7', () => {
      const decision = selectGoStop(5, 10, 8);
      
      // score < 7, should go
      expect(decision).toBe('go');
    });

    it('should go when score is 6', () => {
      const decision = selectGoStop(6, 10, 8);
      
      // score < 7, should go
      expect(decision).toBe('go');
    });

    it('should make random decision when score >= 7 and lead < 10', () => {
      const decisions = new Set<string>();
      
      // Run multiple times to check randomness
      for (let i = 0; i < 100; i++) {
        const decision = selectGoStop(8, 12, 8);
        decisions.add(decision);
      }
      
      // Should have both 'go' and 'stop' in results (random behavior)
      // With 70% stop, 30% go, we should see both in 100 iterations
      expect(decisions.size).toBeGreaterThan(1);
      expect(decisions.has('go') || decisions.has('stop')).toBe(true);
    });

    it('should prefer stop over go in random case (70% stop)', () => {
      const results = { go: 0, stop: 0 };
      
      // Run 1000 times to check distribution
      for (let i = 0; i < 1000; i++) {
        const decision = selectGoStop(8, 12, 8);
        results[decision]++;
      }
      
      // Should have more stops than goes (approximately 70% vs 30%)
      expect(results.stop).toBeGreaterThan(results.go);
      
      // Check rough distribution (allow some variance)
      const stopRatio = results.stop / 1000;
      expect(stopRatio).toBeGreaterThan(0.6); // At least 60%
      expect(stopRatio).toBeLessThan(0.8); // At most 80%
    });
  });
});
