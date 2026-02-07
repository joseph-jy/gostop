import { describe, it, expect } from 'vitest';
import { findMatchingCards, getValidMoves, applyMatch } from '../game/matching';
import { Card, Month, CardType } from '../game/cards';

describe('findMatchingCards', () => {
  it('should find cards with the same month', () => {
    const card: Card = {
      id: 'january-gwang',
      month: Month.January,
      type: CardType.Gwang,
      imagePath: 'cards/january-gwang.png',
    };

    const field: Card[] = [
      {
        id: 'january-tti',
        month: Month.January,
        type: CardType.Tti,
        imagePath: 'cards/january-tti.png',
      },
      {
        id: 'february-yeol',
        month: Month.February,
        type: CardType.Yeol,
        imagePath: 'cards/february-yeol.png',
      },
      {
        id: 'january-pi-1',
        month: Month.January,
        type: CardType.Pi,
        imagePath: 'cards/january-pi-1.png',
      },
    ];

    const matches = findMatchingCards(card, field);
    expect(matches).toHaveLength(2);
    expect(matches).toContainEqual(field[0]); // january-tti
    expect(matches).toContainEqual(field[2]); // january-pi-1
  });

  it('should return empty array when no matches', () => {
    const card: Card = {
      id: 'march-gwang',
      month: Month.March,
      type: CardType.Gwang,
      imagePath: 'cards/march-gwang.png',
    };

    const field: Card[] = [
      {
        id: 'january-tti',
        month: Month.January,
        type: CardType.Tti,
        imagePath: 'cards/january-tti.png',
      },
      {
        id: 'february-yeol',
        month: Month.February,
        type: CardType.Yeol,
        imagePath: 'cards/february-yeol.png',
      },
    ];

    const matches = findMatchingCards(card, field);
    expect(matches).toHaveLength(0);
  });

  it('should return empty array when field is empty', () => {
    const card: Card = {
      id: 'january-gwang',
      month: Month.January,
      type: CardType.Gwang,
      imagePath: 'cards/january-gwang.png',
    };

    const matches = findMatchingCards(card, []);
    expect(matches).toHaveLength(0);
  });
});

describe('getValidMoves', () => {
  it('should return all cards from hand (all cards are valid moves)', () => {
    const hand: Card[] = [
      {
        id: 'january-gwang',
        month: Month.January,
        type: CardType.Gwang,
        imagePath: 'cards/january-gwang.png',
      },
      {
        id: 'february-yeol',
        month: Month.February,
        type: CardType.Yeol,
        imagePath: 'cards/february-yeol.png',
      },
      {
        id: 'march-gwang',
        month: Month.March,
        type: CardType.Gwang,
        imagePath: 'cards/march-gwang.png',
      },
    ];

    const validMoves = getValidMoves(hand);
    expect(validMoves).toHaveLength(3);
    expect(validMoves).toEqual(hand);
  });

  it('should return empty array when hand is empty', () => {
    const validMoves = getValidMoves([]);
    expect(validMoves).toHaveLength(0);
  });
});

describe('applyMatch', () => {
  it('should add card to field when no matches (0 matches)', () => {
    const card: Card = {
      id: 'march-gwang',
      month: Month.March,
      type: CardType.Gwang,
      imagePath: 'cards/march-gwang.png',
    };

    const field: Card[] = [
      {
        id: 'january-tti',
        month: Month.January,
        type: CardType.Tti,
        imagePath: 'cards/january-tti.png',
      },
      {
        id: 'february-yeol',
        month: Month.February,
        type: CardType.Yeol,
        imagePath: 'cards/february-yeol.png',
      },
    ];

    const result = applyMatch(card, field);
    expect(result.captured).toHaveLength(0);
    expect(result.remainingField).toHaveLength(3);
    expect(result.remainingField).toContainEqual(card);
    expect(result.remainingField).toContainEqual(field[0]);
    expect(result.remainingField).toContainEqual(field[1]);
  });

  it('should capture both cards when exactly 1 match', () => {
    const card: Card = {
      id: 'january-gwang',
      month: Month.January,
      type: CardType.Gwang,
      imagePath: 'cards/january-gwang.png',
    };

    const field: Card[] = [
      {
        id: 'january-tti',
        month: Month.January,
        type: CardType.Tti,
        imagePath: 'cards/january-tti.png',
      },
      {
        id: 'february-yeol',
        month: Month.February,
        type: CardType.Yeol,
        imagePath: 'cards/february-yeol.png',
      },
    ];

    const result = applyMatch(card, field);
    expect(result.captured).toHaveLength(2);
    expect(result.captured).toContainEqual(card);
    expect(result.captured).toContainEqual(field[0]); // january-tti
    expect(result.remainingField).toHaveLength(1);
    expect(result.remainingField).toContainEqual(field[1]); // february-yeol
  });

  it('should return special indicator for 2+ matches', () => {
    const card: Card = {
      id: 'january-gwang',
      month: Month.January,
      type: CardType.Gwang,
      imagePath: 'cards/january-gwang.png',
    };

    const field: Card[] = [
      {
        id: 'january-tti',
        month: Month.January,
        type: CardType.Tti,
        imagePath: 'cards/january-tti.png',
      },
      {
        id: 'january-pi-1',
        month: Month.January,
        type: CardType.Pi,
        imagePath: 'cards/january-pi-1.png',
      },
      {
        id: 'february-yeol',
        month: Month.February,
        type: CardType.Yeol,
        imagePath: 'cards/february-yeol.png',
      },
    ];

    const result = applyMatch(card, field);
    expect(result.requiresChoice).toBe(true);
    expect(result.matchingCards).toHaveLength(2);
    expect(result.matchingCards).toContainEqual(field[0]); // january-tti
    expect(result.matchingCards).toContainEqual(field[1]); // january-pi-1
  });

  it('should not mutate input field array', () => {
    const card: Card = {
      id: 'january-gwang',
      month: Month.January,
      type: CardType.Gwang,
      imagePath: 'cards/january-gwang.png',
    };

    const field: Card[] = [
      {
        id: 'january-tti',
        month: Month.January,
        type: CardType.Tti,
        imagePath: 'cards/january-tti.png',
      },
    ];

    const originalLength = field.length;
    applyMatch(card, field);
    expect(field).toHaveLength(originalLength);
  });
});
