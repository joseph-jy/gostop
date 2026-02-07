import { describe, it, expect } from 'vitest';
import {
  hasGodori,
  hasCheongdan,
  hasHongdan,
  hasChodan,
  getCombos,
  getComboScore,
} from '../game/combos';
import { Card, CardType, Month } from '../game/cards';
import { createCard } from './test-helpers';

describe('Combo Detection', () => {
  describe('hasGodori', () => {
    it('should return true when all 3 bird cards are present', () => {
      const cards: Card[] = [
        createCard('february-bird', Month.February, CardType.Yeol),
        createCard('april-bird', Month.April, CardType.Yeol),
        createCard('august-animal', Month.August, CardType.Yeol),
      ];
      expect(hasGodori(cards)).toBe(true);
    });

    it('should return false when only 2 bird cards are present', () => {
      const cards: Card[] = [
        createCard('february-bird', Month.February, CardType.Yeol),
        createCard('april-bird', Month.April, CardType.Yeol),
      ];
      expect(hasGodori(cards)).toBe(false);
    });

    it('should return false when no bird cards are present', () => {
      const cards: Card[] = [
        createCard('january-gwang', Month.January, CardType.Gwang),
        createCard('march-hongdan', Month.March, CardType.Tti),
      ];
      expect(hasGodori(cards)).toBe(false);
    });

    it('should return true when bird cards are mixed with other cards', () => {
      const cards: Card[] = [
        createCard('january-gwang', Month.January, CardType.Gwang),
        createCard('february-bird', Month.February, CardType.Yeol),
        createCard('march-hongdan', Month.March, CardType.Tti),
        createCard('april-bird', Month.April, CardType.Yeol),
        createCard('august-animal', Month.August, CardType.Yeol),
        createCard('may-pi-1', Month.May, CardType.Pi),
      ];
      expect(hasGodori(cards)).toBe(true);
    });
  });

  describe('hasCheongdan', () => {
    it('should return true when all 3 blue ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('june-cheongdan', Month.June, CardType.Tti),
        createCard('september-chodan', Month.September, CardType.Tti),
        createCard('october-chodan', Month.October, CardType.Tti),
      ];
      expect(hasCheongdan(cards)).toBe(true);
    });

    it('should return false when only 2 blue ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('june-cheongdan', Month.June, CardType.Tti),
        createCard('september-chodan', Month.September, CardType.Tti),
      ];
      expect(hasCheongdan(cards)).toBe(false);
    });

    it('should return false when no blue ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('january-hongdan', Month.January, CardType.Tti),
        createCard('february-hongdan', Month.February, CardType.Tti),
      ];
      expect(hasCheongdan(cards)).toBe(false);
    });
  });

  describe('hasHongdan', () => {
    it('should return true when all 3 red ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('january-hongdan', Month.January, CardType.Tti),
        createCard('february-hongdan', Month.February, CardType.Tti),
        createCard('march-hongdan', Month.March, CardType.Tti),
      ];
      expect(hasHongdan(cards)).toBe(true);
    });

    it('should return false when only 2 red ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('january-hongdan', Month.January, CardType.Tti),
        createCard('february-hongdan', Month.February, CardType.Tti),
      ];
      expect(hasHongdan(cards)).toBe(false);
    });

    it('should return false when no red ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('april-hongdan', Month.April, CardType.Tti),
        createCard('may-hongdan', Month.May, CardType.Tti),
      ];
      expect(hasHongdan(cards)).toBe(false);
    });
  });

  describe('hasChodan', () => {
    it('should return true when all 3 green ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('april-hongdan', Month.April, CardType.Tti),
        createCard('may-hongdan', Month.May, CardType.Tti),
        createCard('july-chodan', Month.July, CardType.Tti),
      ];
      expect(hasChodan(cards)).toBe(true);
    });

    it('should return false when only 2 green ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('april-hongdan', Month.April, CardType.Tti),
        createCard('may-hongdan', Month.May, CardType.Tti),
      ];
      expect(hasChodan(cards)).toBe(false);
    });

    it('should return false when no green ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('january-hongdan', Month.January, CardType.Tti),
        createCard('february-hongdan', Month.February, CardType.Tti),
      ];
      expect(hasChodan(cards)).toBe(false);
    });
  });

  describe('getCombos', () => {
    it('should return empty array when no combos are present', () => {
      const cards: Card[] = [
        createCard('january-gwang', Month.January, CardType.Gwang),
        createCard('march-pi-1', Month.March, CardType.Pi),
      ];
      expect(getCombos(cards)).toEqual([]);
    });

    it('should return single combo when one combo is present', () => {
      const cards: Card[] = [
        createCard('february-bird', Month.February, CardType.Yeol),
        createCard('april-bird', Month.April, CardType.Yeol),
        createCard('august-animal', Month.August, CardType.Yeol),
      ];
      expect(getCombos(cards)).toEqual(['godori']);
    });

    it('should return multiple combos when multiple combos are present', () => {
      const cards: Card[] = [
        createCard('february-bird', Month.February, CardType.Yeol),
        createCard('april-bird', Month.April, CardType.Yeol),
        createCard('august-animal', Month.August, CardType.Yeol),
        createCard('january-hongdan', Month.January, CardType.Tti),
        createCard('february-hongdan', Month.February, CardType.Tti),
        createCard('march-hongdan', Month.March, CardType.Tti),
      ];
      const combos = getCombos(cards);
      expect(combos).toHaveLength(2);
      expect(combos).toContain('godori');
      expect(combos).toContain('hongdan');
    });

    it('should return all 4 combos when all are present', () => {
      const cards: Card[] = [
        createCard('february-bird', Month.February, CardType.Yeol),
        createCard('april-bird', Month.April, CardType.Yeol),
        createCard('august-animal', Month.August, CardType.Yeol),
        createCard('january-hongdan', Month.January, CardType.Tti),
        createCard('february-hongdan', Month.February, CardType.Tti),
        createCard('march-hongdan', Month.March, CardType.Tti),
        createCard('april-hongdan', Month.April, CardType.Tti),
        createCard('may-hongdan', Month.May, CardType.Tti),
        createCard('july-chodan', Month.July, CardType.Tti),
        createCard('june-cheongdan', Month.June, CardType.Tti),
        createCard('september-chodan', Month.September, CardType.Tti),
        createCard('october-chodan', Month.October, CardType.Tti),
      ];
      const combos = getCombos(cards);
      expect(combos).toHaveLength(4);
      expect(combos).toContain('godori');
      expect(combos).toContain('hongdan');
      expect(combos).toContain('chodan');
      expect(combos).toContain('cheongdan');
    });
  });

  describe('getComboScore', () => {
    it('should return 0 for empty combo list', () => {
      expect(getComboScore([])).toBe(0);
    });

    it('should return 5 for single combo', () => {
      expect(getComboScore(['godori'])).toBe(5);
    });

    it('should return 10 for two combos', () => {
      expect(getComboScore(['godori', 'hongdan'])).toBe(10);
    });

    it('should return 20 for four combos', () => {
      expect(getComboScore(['godori', 'hongdan', 'chodan', 'cheongdan'])).toBe(20);
    });
  });

  describe('Pure functions - no mutations', () => {
    it('should not mutate input array in hasGodori', () => {
      const cards: Card[] = [
        createCard('february-bird', Month.February, CardType.Yeol),
        createCard('april-bird', Month.April, CardType.Yeol),
      ];
      const originalLength = cards.length;
      hasGodori(cards);
      expect(cards.length).toBe(originalLength);
    });

    it('should not mutate input array in getCombos', () => {
      const cards: Card[] = [
        createCard('february-bird', Month.February, CardType.Yeol),
        createCard('april-bird', Month.April, CardType.Yeol),
        createCard('august-animal', Month.August, CardType.Yeol),
      ];
      const originalLength = cards.length;
      getCombos(cards);
      expect(cards.length).toBe(originalLength);
    });
  });
});
