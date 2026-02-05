import { describe, it, expect } from 'vitest';
import {
  detectJjok,
  detectPpuk,
  detectBomb,
  detectChongtong,
  canShake,
  applyJjok,
  applyPpuk,
  applyBomb,
  applyChongtong,
  applyShake,
} from '../game/special-rules';
import { Card, CardType, Month } from '../game/cards';

const createCard = (month: Month, type: CardType, id: string): Card => ({
  id,
  month,
  type,
  imagePath: `cards/${id}.png`,
});

describe('Special Rules - Detection', () => {
  describe('detectJjok', () => {
    it('should detect jjok when field has 2 same-month cards', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];

      expect(detectJjok(card, field)).toBe(true);
    });

    it('should not detect jjok when field has 1 same-month card', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];

      expect(detectJjok(card, field)).toBe(false);
    });

    it('should not detect jjok when field has 3 same-month cards (this is ppuk)', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
      ];

      expect(detectJjok(card, field)).toBe(false);
    });

    it('should not detect jjok when no same-month cards in field', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
        createCard(Month.March, CardType.Pi, 'march-pi-1'),
      ];

      expect(detectJjok(card, field)).toBe(false);
    });
  });

  describe('detectPpuk', () => {
    it('should detect ppuk when field has 3 same-month cards', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];

      expect(detectPpuk(card, field)).toBe(true);
    });

    it('should not detect ppuk when field has 2 same-month cards', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
      ];

      expect(detectPpuk(card, field)).toBe(false);
    });

    it('should not detect ppuk when no same-month cards in field', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];

      expect(detectPpuk(card, field)).toBe(false);
    });
  });

  describe('detectBomb', () => {
    it('should detect bomb when hand has 3 cards of same month', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];

      expect(detectBomb(hand)).toEqual([Month.January]);
    });

    it('should detect multiple bombs in hand', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
        createCard(Month.February, CardType.Pi, 'february-pi-2'),
        createCard(Month.February, CardType.Tti, 'february-tti'),
      ];

      const result = detectBomb(hand);
      expect(result).toContain(Month.January);
      expect(result).toContain(Month.February);
      expect(result.length).toBe(2);
    });

    it('should not detect bomb when no month has 3 cards', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
        createCard(Month.March, CardType.Pi, 'march-pi-1'),
      ];

      expect(detectBomb(hand)).toEqual([]);
    });
  });

  describe('detectChongtong', () => {
    it('should detect chongtong when hand has 4 cards of same month', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];

      expect(detectChongtong(hand)).toEqual([Month.January]);
    });

    it('should not detect chongtong when hand has only 3 cards of same month', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];

      expect(detectChongtong(hand)).toEqual([]);
    });

    it('should detect multiple chongtongs (theoretical edge case)', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Gwang, 'february-gwang'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
        createCard(Month.February, CardType.Pi, 'february-pi-2'),
        createCard(Month.February, CardType.Tti, 'february-tti'),
      ];

      const result = detectChongtong(hand);
      expect(result).toContain(Month.January);
      expect(result).toContain(Month.February);
    });
  });

  describe('canShake', () => {
    it('should allow shake when field has 2 same-month and hand has 1 same-month', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const hand = [card];
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];

      expect(canShake(card, hand, field)).toBe(true);
    });

    it('should not allow shake when field has only 1 same-month card', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const hand = [card];
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];

      expect(canShake(card, hand, field)).toBe(false);
    });

    it('should not allow shake when hand has no same-month card', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const hand = [card];
      const field = [
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
        createCard(Month.February, CardType.Tti, 'february-tti'),
      ];

      expect(canShake(card, hand, field)).toBe(false);
    });

    it('should not allow shake when field has 3 same-month cards (ppuk will happen)', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const hand = [card];
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
      ];

      expect(canShake(card, hand, field)).toBe(false);
    });
  });
});

describe('Special Rules - Application', () => {
  describe('applyJjok', () => {
    it('should capture all 3 same-month cards and steal 1 opponent pi', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
        createCard(Month.March, CardType.Pi, 'march-pi-1'),
      ];
      const opponentPi = [
        createCard(Month.April, CardType.Pi, 'april-pi-1'),
        createCard(Month.May, CardType.Pi, 'may-pi-1'),
      ];

      const result = applyJjok(card, field, opponentPi);

      expect(result.captured.length).toBe(3);
      expect(result.captured).toContainEqual(card);
      expect(result.captured).toContainEqual(field[0]);
      expect(result.captured).toContainEqual(field[1]);
      expect(result.remainingField.length).toBe(2);
      expect(result.remainingField).toContainEqual(field[2]);
      expect(result.remainingField).toContainEqual(field[3]);
      expect(result.stolenPi.length).toBe(1);
      expect(result.stolenPi[0]).toEqual(opponentPi[0]);
    });

    it('should capture all 3 cards but steal nothing when opponent has no pi', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];
      const opponentPi: Card[] = [];

      const result = applyJjok(card, field, opponentPi);

      expect(result.captured.length).toBe(3);
      expect(result.stolenPi.length).toBe(0);
    });
  });

  describe('applyPpuk', () => {
    it('should capture all 4 same-month cards', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
        createCard(Month.March, CardType.Pi, 'march-pi-1'),
      ];

      const result = applyPpuk(card, field);

      expect(result.captured.length).toBe(4);
      expect(result.captured).toContainEqual(card);
      expect(result.remainingField.length).toBe(2);
      expect(result.remainingField).toContainEqual(field[3]);
      expect(result.remainingField).toContainEqual(field[4]);
    });

    it('should handle ppuk with exactly 3 field cards', () => {
      const card = createCard(Month.January, CardType.Gwang, 'january-gwang');
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
      ];

      const result = applyPpuk(card, field);

      expect(result.captured.length).toBe(4);
      expect(result.remainingField.length).toBe(0);
    });
  });

  describe('applyBomb', () => {
    it('should play all 3 cards, capture field same-month cards, and steal 1 opponent pi', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];
      const field = [
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.February, CardType.Pi, 'february-pi-2'),
        createCard(Month.March, CardType.Pi, 'march-pi-1'),
      ];
      const opponentPi = [
        createCard(Month.April, CardType.Pi, 'april-pi-1'),
        createCard(Month.May, CardType.Pi, 'may-pi-1'),
      ];

      const result = applyBomb(Month.January, hand, field, opponentPi);

      expect(result.captured.length).toBe(4);
      expect(result.remainingHand.length).toBe(1);
      expect(result.remainingHand).toContainEqual(hand[3]);
      expect(result.remainingField.length).toBe(2);
      expect(result.stolenPi.length).toBe(1);
    });

    it('should work when field has no same-month cards', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
      ];
      const field = [
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
        createCard(Month.March, CardType.Pi, 'march-pi-1'),
      ];
      const opponentPi = [
        createCard(Month.April, CardType.Pi, 'april-pi-1'),
      ];

      const result = applyBomb(Month.January, hand, field, opponentPi);

      expect(result.captured.length).toBe(3);
      expect(result.remainingField.length).toBe(2);
      expect(result.stolenPi.length).toBe(1);
    });

    it('should not steal pi when opponent has no pi', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
      ];
      const field = [
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];
      const opponentPi: Card[] = [];

      const result = applyBomb(Month.January, hand, field, opponentPi);

      expect(result.captured.length).toBe(3);
      expect(result.stolenPi.length).toBe(0);
    });
  });

  describe('applyChongtong', () => {
    it('should capture all 4 cards and steal 2 opponent pi', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
        createCard(Month.February, CardType.Pi, 'february-pi-1'),
      ];
      const opponentPi = [
        createCard(Month.March, CardType.Pi, 'march-pi-1'),
        createCard(Month.April, CardType.Pi, 'april-pi-1'),
        createCard(Month.May, CardType.Pi, 'may-pi-1'),
      ];

      const result = applyChongtong(Month.January, hand, opponentPi);

      expect(result.captured.length).toBe(4);
      expect(result.remainingHand.length).toBe(1);
      expect(result.remainingHand).toContainEqual(hand[4]);
      expect(result.stolenPi.length).toBe(2);
    });

    it('should steal only available pi when opponent has less than 2', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
      ];
      const opponentPi = [
        createCard(Month.March, CardType.Pi, 'march-pi-1'),
      ];

      const result = applyChongtong(Month.January, hand, opponentPi);

      expect(result.captured.length).toBe(4);
      expect(result.stolenPi.length).toBe(1);
    });

    it('should steal nothing when opponent has no pi', () => {
      const hand = [
        createCard(Month.January, CardType.Gwang, 'january-gwang'),
        createCard(Month.January, CardType.Pi, 'january-pi-1'),
        createCard(Month.January, CardType.Pi, 'january-pi-2'),
        createCard(Month.January, CardType.Tti, 'january-tti'),
      ];
      const opponentPi: Card[] = [];

      const result = applyChongtong(Month.January, hand, opponentPi);

      expect(result.captured.length).toBe(4);
      expect(result.stolenPi.length).toBe(0);
    });
  });

  describe('applyShake', () => {
    it('should apply 2x multiplier on successful shake (jjok achieved)', () => {
      const result = applyShake(true, 1);

      expect(result.multiplier).toBe(2);
      expect(result.success).toBe(true);
    });

    it('should cancel multiplier on failed shake (ppuk occurred)', () => {
      const result = applyShake(false, 2);

      expect(result.multiplier).toBe(1);
      expect(result.success).toBe(false);
    });

    it('should stack multipliers for multiple successful shakes', () => {
      const firstShake = applyShake(true, 1);
      expect(firstShake.multiplier).toBe(2);

      const secondShake = applyShake(true, firstShake.multiplier);
      expect(secondShake.multiplier).toBe(4);

      const thirdShake = applyShake(true, secondShake.multiplier);
      expect(thirdShake.multiplier).toBe(8);
    });

    it('should reset to 1 on any failed shake', () => {
      const result = applyShake(false, 4);

      expect(result.multiplier).toBe(1);
      expect(result.success).toBe(false);
    });

    it('should handle initial multiplier of 1', () => {
      const result = applyShake(true, 1);

      expect(result.multiplier).toBe(2);
    });
  });
});
