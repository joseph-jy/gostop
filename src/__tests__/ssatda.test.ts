import { describe, it, expect } from 'vitest';
import { CardType, Month } from '../game/cards';
import { createCard } from './test-helpers';
import {
  detectSsatda,
  applySsatda,
  detectJjoknassda,
  detectPpuk,
} from '../game/special-rules';

describe('detectSsatda', () => {
  it('should return true when hand card and deck card are same month', () => {
    const handCard = createCard('january-gwang', Month.January, CardType.Gwang);
    const deckCard = createCard('january-pi-1', Month.January, CardType.Pi);

    expect(detectSsatda(handCard, deckCard)).toBe(true);
  });

  it('should return false when hand card and deck card are different months', () => {
    const handCard = createCard('january-gwang', Month.January, CardType.Gwang);
    const deckCard = createCard('february-bird', Month.February, CardType.Yeol);

    expect(detectSsatda(handCard, deckCard)).toBe(false);
  });
});

describe('applySsatda', () => {
  it('should leave all 3 cards on the field', () => {
    const handCard = createCard('january-gwang', Month.January, CardType.Gwang);
    const matchedFieldCard = createCard('january-hongdan', Month.January, CardType.Tti);
    const deckCard = createCard('january-pi-1', Month.January, CardType.Pi);

    const existingField = [
      matchedFieldCard,
      createCard('february-bird', Month.February, CardType.Yeol),
    ];

    const result = applySsatda(handCard, matchedFieldCard, deckCard, existingField);

    // matchedFieldCard was already in field, handCard and deckCard are added
    expect(result.remainingField).toHaveLength(4);
    expect(result.remainingField).toContainEqual(handCard);
    expect(result.remainingField).toContainEqual(deckCard);
    expect(result.remainingField).toContainEqual(matchedFieldCard);
  });

  it('should preserve other month cards on the field', () => {
    const handCard = createCard('march-gwang', Month.March, CardType.Gwang);
    const matchedFieldCard = createCard('march-hongdan', Month.March, CardType.Tti);
    const deckCard = createCard('march-pi-1', Month.March, CardType.Pi);

    const otherCard = createCard('june-cheongdan', Month.June, CardType.Tti);
    const existingField = [matchedFieldCard, otherCard];

    const result = applySsatda(handCard, matchedFieldCard, deckCard, existingField);

    expect(result.remainingField).toContainEqual(otherCard);
  });
});

describe('detectJjoknassda', () => {
  it('should return true when hand card and deck card are same month', () => {
    const handCard = createCard('april-hongdan', Month.April, CardType.Tti);
    const deckCard = createCard('april-bird', Month.April, CardType.Yeol);

    expect(detectJjoknassda(handCard, deckCard)).toBe(true);
  });

  it('should return false when hand card and deck card are different months', () => {
    const handCard = createCard('april-hongdan', Month.April, CardType.Tti);
    const deckCard = createCard('may-hongdan', Month.May, CardType.Tti);

    expect(detectJjoknassda(handCard, deckCard)).toBe(false);
  });
});

describe('Ssatda integration with Ppuk', () => {
  it('should detect ppuk when 4th card is played on field with 3 same-month cards from ssatda', () => {
    // After ssatda, 3 cards of same month are on the field
    const fieldCards = [
      createCard('january-gwang', Month.January, CardType.Gwang),
      createCard('january-hongdan', Month.January, CardType.Tti),
      createCard('january-pi-1', Month.January, CardType.Pi),
      createCard('february-bird', Month.February, CardType.Yeol),
    ];

    // 4th January card is played
    const fourthCard = createCard('january-pi-2', Month.January, CardType.Pi);

    expect(detectPpuk(fourthCard, fieldCards)).toBe(true);
  });
});
