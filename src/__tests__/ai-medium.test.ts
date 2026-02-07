import { describe, it, expect } from 'vitest';
import { selectMove, selectGoStop } from '../ai/medium';
import { Card, CardType, Month } from '../game/cards';
import { createMockGameState } from './test-helpers';

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

      const state = createMockGameState({
        aiHand: hand,
        field,
        currentTurn: 'ai',
        phase: 'select-hand',
      });

      const selected = selectMove(state, hand, field, []);

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

      const state = createMockGameState({
        aiHand: hand,
        field,
        aiCapture: [
          { id: 'february-bird', month: Month.February, type: CardType.Yeol, imagePath: '' },
          { id: 'april-bird', month: Month.April, type: CardType.Yeol, imagePath: '' },
        ],
        currentTurn: 'ai',
        phase: 'select-hand',
      });

      const selected = selectMove(state, hand, field, []);

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

      const state = createMockGameState({
        aiHand: hand,
        field,
        aiCapture: [
          { id: 'january-hongdan', month: Month.January, type: CardType.Tti, imagePath: '' },
          { id: 'february-hongdan', month: Month.February, type: CardType.Tti, imagePath: '' },
        ],
        currentTurn: 'ai',
        phase: 'select-hand',
      });

      const selected = selectMove(state, hand, field, []);

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

      const state = createMockGameState({
        aiHand: hand,
        field,
        currentTurn: 'ai',
        phase: 'select-hand',
      });

      const selected = selectMove(state, hand, field, []);

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

      const state = createMockGameState({
        aiHand: hand,
        field,
        currentTurn: 'ai',
        phase: 'select-hand',
      });

      const start = Date.now();
      selectMove(state, hand, field, []);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('selectGoStop', () => {
    it('should stop when leading by 10+ points', () => {
      const decision = selectGoStop(8, 15, 5, 15);

      expect(decision).toBe('stop');
    });

    it('should stop when leading by more than 10 points', () => {
      const decision = selectGoStop(10, 20, 5, 20);

      expect(decision).toBe('stop');
    });

    it('should go when score is less than 7', () => {
      const decision = selectGoStop(5, 10, 8, 10);

      expect(decision).toBe('go');
    });

    it('should go when score is 6', () => {
      const decision = selectGoStop(6, 10, 8, 10);

      expect(decision).toBe('go');
    });

    it('should make random decision when score >= 7 and lead < 10', () => {
      const decisions = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const decision = selectGoStop(8, 12, 8, 12);
        decisions.add(decision);
      }

      expect(decisions.size).toBeGreaterThan(1);
      expect(decisions.has('go') || decisions.has('stop')).toBe(true);
    });

    it('should prefer stop over go in random case (70% stop)', () => {
      const results = { go: 0, stop: 0 };

      for (let i = 0; i < 1000; i++) {
        const decision = selectGoStop(8, 12, 8, 12);
        results[decision]++;
      }

      expect(results.stop).toBeGreaterThan(results.go);

      const stopRatio = results.stop / 1000;
      expect(stopRatio).toBeGreaterThan(0.6);
      expect(stopRatio).toBeLessThan(0.8);
    });
  });
});
