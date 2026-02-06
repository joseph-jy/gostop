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

// Helper to create test cards
const createCard = (id: string, month: Month, type: CardType): Card => ({
  id,
  month,
  type,
  imagePath: `cards/${id}.png`,
});

describe('Combo Detection', () => {
  describe('hasGodori', () => {
    it('should return true when all 3 bird cards are present', () => {
      const cards: Card[] = [
        createCard('february-yeol', Month.February, CardType.Yeol), // February bird
        createCard('april-yeol', Month.April, CardType.Yeol), // April bird
        createCard('august-yeol', Month.August, CardType.Yeol), // August bird
      ];
      expect(hasGodori(cards)).toBe(true);
    });

    it('should return false when only 2 bird cards are present', () => {
      const cards: Card[] = [
        createCard('february-yeol', Month.February, CardType.Yeol),
        createCard('april-yeol', Month.April, CardType.Yeol),
      ];
      expect(hasGodori(cards)).toBe(false);
    });

    it('should return false when no bird cards are present', () => {
      const cards: Card[] = [
        createCard('january-gwang', Month.January, CardType.Gwang),
        createCard('march-tti', Month.March, CardType.Tti),
      ];
      expect(hasGodori(cards)).toBe(false);
    });

    it('should return true when bird cards are mixed with other cards', () => {
      const cards: Card[] = [
        createCard('january-gwang', Month.January, CardType.Gwang),
        createCard('february-yeol', Month.February, CardType.Yeol),
        createCard('march-tti', Month.March, CardType.Tti),
        createCard('april-yeol', Month.April, CardType.Yeol),
        createCard('august-yeol', Month.August, CardType.Yeol),
        createCard('may-pi-1', Month.May, CardType.Pi),
      ];
      expect(hasGodori(cards)).toBe(true);
    });
  });

  describe('hasCheongdan', () => {
    it('should return true when all 3 blue ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('june-tti', Month.June, CardType.Tti),
        createCard('september-tti', Month.September, CardType.Tti),
        createCard('october-tti', Month.October, CardType.Tti),
      ];
      expect(hasCheongdan(cards)).toBe(true);
    });

    it('should return false when only 2 blue ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('june-tti', Month.June, CardType.Tti),
        createCard('september-tti', Month.September, CardType.Tti),
      ];
      expect(hasCheongdan(cards)).toBe(false);
    });

    it('should return false when no blue ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('january-tti', Month.January, CardType.Tti),
        createCard('february-tti', Month.February, CardType.Tti),
      ];
      expect(hasCheongdan(cards)).toBe(false);
    });
  });

  describe('hasHongdan', () => {
    it('should return true when all 3 red ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('january-tti', Month.January, CardType.Tti),
        createCard('february-tti', Month.February, CardType.Tti),
        createCard('march-tti', Month.March, CardType.Tti),
      ];
      expect(hasHongdan(cards)).toBe(true);
    });

    it('should return false when only 2 red ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('january-tti', Month.January, CardType.Tti),
        createCard('february-tti', Month.February, CardType.Tti),
      ];
      expect(hasHongdan(cards)).toBe(false);
    });

    it('should return false when no red ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('april-tti', Month.April, CardType.Tti),
        createCard('may-tti', Month.May, CardType.Tti),
      ];
      expect(hasHongdan(cards)).toBe(false);
    });
  });

  describe('hasChodan', () => {
    it('should return true when all 3 green ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('april-tti', Month.April, CardType.Tti),
        createCard('may-tti', Month.May, CardType.Tti),
        createCard('july-tti', Month.July, CardType.Tti),
      ];
      expect(hasChodan(cards)).toBe(true);
    });

    it('should return false when only 2 green ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('april-tti', Month.April, CardType.Tti),
        createCard('may-tti', Month.May, CardType.Tti),
      ];
      expect(hasChodan(cards)).toBe(false);
    });

    it('should return false when no green ribbon cards are present', () => {
      const cards: Card[] = [
        createCard('january-tti', Month.January, CardType.Tti),
        createCard('february-tti', Month.February, CardType.Tti),
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
        createCard('february-yeol', Month.February, CardType.Yeol),
        createCard('april-yeol', Month.April, CardType.Yeol),
        createCard('august-yeol', Month.August, CardType.Yeol),
      ];
      expect(getCombos(cards)).toEqual(['godori']);
    });

    it('should return multiple combos when multiple combos are present', () => {
      const cards: Card[] = [
        createCard('february-yeol', Month.February, CardType.Yeol), // Godori
        createCard('april-yeol', Month.April, CardType.Yeol), // Godori
        createCard('august-yeol', Month.August, CardType.Yeol), // Godori
        createCard('january-tti', Month.January, CardType.Tti), // Hongdan
        createCard('february-tti', Month.February, CardType.Tti), // Hongdan
        createCard('march-tti', Month.March, CardType.Tti), // Hongdan
      ];
      const combos = getCombos(cards);
      expect(combos).toHaveLength(2);
      expect(combos).toContain('godori');
      expect(combos).toContain('hongdan');
    });

    it('should return all 4 combos when all are present', () => {
      const cards: Card[] = [
        createCard('february-yeol', Month.February, CardType.Yeol), // Godori
        createCard('april-yeol', Month.April, CardType.Yeol), // Godori
        createCard('august-yeol', Month.August, CardType.Yeol), // Godori
        createCard('january-tti', Month.January, CardType.Tti), // Hongdan
        createCard('february-tti', Month.February, CardType.Tti), // Hongdan
        createCard('march-tti', Month.March, CardType.Tti), // Hongdan
        createCard('april-tti', Month.April, CardType.Tti), // Chodan
        createCard('may-tti', Month.May, CardType.Tti), // Chodan
        createCard('july-tti', Month.July, CardType.Tti), // Chodan
        createCard('june-tti', Month.June, CardType.Tti), // Cheongdan
        createCard('september-tti', Month.September, CardType.Tti), // Cheongdan
        createCard('october-tti', Month.October, CardType.Tti), // Cheongdan
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
        createCard('february-yeol', Month.February, CardType.Yeol),
        createCard('april-yeol', Month.April, CardType.Yeol),
      ];
      const originalLength = cards.length;
      hasGodori(cards);
      expect(cards.length).toBe(originalLength);
    });

    it('should not mutate input array in getCombos', () => {
      const cards: Card[] = [
        createCard('february-yeol', Month.February, CardType.Yeol),
        createCard('april-yeol', Month.April, CardType.Yeol),
        createCard('august-yeol', Month.August, CardType.Yeol),
      ];
      const originalLength = cards.length;
      getCombos(cards);
      expect(cards.length).toBe(originalLength);
    });
  });
});
