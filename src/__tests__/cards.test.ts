import { describe, it, expect } from 'vitest';
import { CARDS, Month, CardType } from '../game/cards';

describe('Hwatu Cards', () => {
  describe('Card Constants', () => {
    it('should have exactly 48 cards', () => {
      expect(CARDS).toHaveLength(48);
    });

    it('should have exactly 4 cards per month', () => {
      const cardsByMonth = new Map<Month, number>();
      
      CARDS.forEach(card => {
        cardsByMonth.set(card.month, (cardsByMonth.get(card.month) || 0) + 1);
      });

      expect(cardsByMonth.size).toBe(12);
      cardsByMonth.forEach(count => {
        expect(count).toBe(4);
      });
    });

    it('should have correct card type distribution', () => {
      const typeCount = {
        [CardType.Gwang]: 0,
        [CardType.Yeol]: 0,
        [CardType.Tti]: 0,
        [CardType.Pi]: 0,
      };

      CARDS.forEach(card => {
        typeCount[card.type]++;
      });

      expect(typeCount[CardType.Gwang]).toBe(5); // 광 5장
      expect(typeCount[CardType.Yeol]).toBe(9);  // 열끗 9장
      expect(typeCount[CardType.Tti]).toBe(9);   // 띠 9장
      expect(typeCount[CardType.Pi]).toBe(25);   // 피 25장
    });

    it('should have unique card IDs', () => {
      const ids = CARDS.map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(48);
    });

    it('should have valid image paths for all cards', () => {
      CARDS.forEach(card => {
        expect(card.imagePath).toBeTruthy();
        expect(card.imagePath).toMatch(/^assets\/cards\//);
        expect(card.imagePath).toMatch(/\.png$/);
      });
    });
  });

  describe('Card Structure', () => {
    it('should have all required properties on each card', () => {
      CARDS.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('month');
        expect(card).toHaveProperty('type');
        expect(card).toHaveProperty('imagePath');
      });
    });

    it('should have valid month values', () => {
      const validMonths = Object.values(Month);
      CARDS.forEach(card => {
        expect(validMonths).toContain(card.month);
      });
    });

    it('should have valid card type values', () => {
      const validTypes = Object.values(CardType);
      CARDS.forEach(card => {
        expect(validTypes).toContain(card.type);
      });
    });
  });

  describe('Specific Card Distributions', () => {
    it('should have 5 Gwang cards in correct months', () => {
      const gwangCards = CARDS.filter(card => card.type === CardType.Gwang);
      expect(gwangCards).toHaveLength(5);
      
      const gwangMonths = gwangCards.map(card => card.month).sort((a, b) => a - b);
      expect(gwangMonths).toEqual([
        Month.January,
        Month.March,
        Month.August,
        Month.November,
        Month.December,
      ]);
    });

    it('should have 9 Yeol cards in correct months', () => {
      const yeolCards = CARDS.filter(card => card.type === CardType.Yeol);
      expect(yeolCards).toHaveLength(9);

      const yeolMonths = yeolCards.map(card => card.month).sort((a, b) => a - b);
      expect(yeolMonths).toEqual([
        Month.February,
        Month.April,
        Month.May,
        Month.June,
        Month.July,
        Month.August,
        Month.September,
        Month.October,
        Month.December,
      ]);
    });

    it('should have 9 Tti cards distributed correctly', () => {
      const ttiCards = CARDS.filter(card => card.type === CardType.Tti);
      expect(ttiCards).toHaveLength(9);
    });

    it('should have 25 Pi cards', () => {
      const piCards = CARDS.filter(card => card.type === CardType.Pi);
      expect(piCards).toHaveLength(25);
    });
  });

  describe('Enums', () => {
    it('should have all 12 months in Month enum', () => {
      const months = Object.values(Month).filter(v => typeof v === 'number');
      expect(months).toHaveLength(12);
    });

    it('should have all 4 card types in CardType enum', () => {
      const types = Object.values(CardType);
      expect(types).toHaveLength(4);
    });
  });
});
