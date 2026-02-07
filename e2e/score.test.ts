import { test, expect } from '@playwright/test';
import { Card, CardType, Month } from '../src/game/cards';
import { calculateScore } from '../src/game/state';
import { getCombos, getComboScore } from '../src/game/combos';

function createTestCard(id: string, month: Month, type: CardType): Card {
  return {
    id,
    month,
    type,
    imagePath: `test-${id}.png`,
  };
}

test.describe('Score Calculation', () => {
  test('should calculate gwang score correctly', async () => {
    const gwangCards: Card[] = [
      createTestCard('january-gwang', Month.January, CardType.Gwang),
      createTestCard('march-gwang', Month.March, CardType.Gwang),
      createTestCard('august-gwang', Month.August, CardType.Gwang),
    ];

    const score = calculateScore(gwangCards);
    expect(score).toBe(7);
  });

  test('should calculate yeol score correctly', async () => {
    const yeolCards: Card[] = [
      createTestCard('february-yeol', Month.February, CardType.Yeol),
      createTestCard('april-yeol', Month.April, CardType.Yeol),
      createTestCard('may-yeol', Month.May, CardType.Yeol),
      createTestCard('june-yeol', Month.June, CardType.Yeol),
      createTestCard('july-yeol', Month.July, CardType.Yeol),
      createTestCard('august-yeol', Month.August, CardType.Yeol),
    ];

    const score = calculateScore(yeolCards);
    expect(score).toBe(2);
  });

  test('should calculate tti score correctly', async () => {
    const ttiCards: Card[] = [
      createTestCard('january-tti', Month.January, CardType.Tti),
      createTestCard('february-tti', Month.February, CardType.Tti),
      createTestCard('march-tti', Month.March, CardType.Tti),
      createTestCard('april-tti', Month.April, CardType.Tti),
      createTestCard('may-tti', Month.May, CardType.Tti),
      createTestCard('june-tti', Month.June, CardType.Tti),
    ];

    const score = calculateScore(ttiCards);
    expect(score).toBe(2);
  });

  test('should calculate pi score correctly', async () => {
    const piCards: Card[] = [];
    for (let i = 0; i < 12; i++) {
      piCards.push(createTestCard(`pi-${i}`, Month.January, CardType.Pi));
    }

    const score = calculateScore(piCards);
    expect(score).toBe(3);
  });

  test('should calculate combo scores correctly', async () => {
    const godoriCards: Card[] = [
      createTestCard('february-yeol', Month.February, CardType.Yeol),
      createTestCard('april-yeol', Month.April, CardType.Yeol),
      createTestCard('august-yeol', Month.August, CardType.Yeol),
    ];

    const combos = getCombos(godoriCards);
    const comboScore = getComboScore(combos);

    expect(combos).toContain('godori');
    expect(comboScore).toBe(5);
  });

  test('should calculate total score with multiple types', async () => {
    const mixedCards: Card[] = [
      createTestCard('january-gwang', Month.January, CardType.Gwang),
      createTestCard('march-gwang', Month.March, CardType.Gwang),
      createTestCard('august-gwang', Month.August, CardType.Gwang),
      createTestCard('february-yeol', Month.February, CardType.Yeol),
      createTestCard('april-yeol', Month.April, CardType.Yeol),
      createTestCard('may-yeol', Month.May, CardType.Yeol),
      createTestCard('june-yeol', Month.June, CardType.Yeol),
      createTestCard('july-yeol', Month.July, CardType.Yeol),
      createTestCard('january-tti', Month.January, CardType.Tti),
      createTestCard('february-tti', Month.February, CardType.Tti),
      createTestCard('march-tti', Month.March, CardType.Tti),
      createTestCard('april-tti', Month.April, CardType.Tti),
      createTestCard('may-tti', Month.May, CardType.Tti),
    ];

    for (let i = 0; i < 10; i++) {
      mixedCards.push(createTestCard(`pi-${i}`, Month.January, CardType.Pi));
    }

    const score = calculateScore(mixedCards);
    expect(score).toBeGreaterThan(10);
  });

  test('should handle zero score correctly', async () => {
    const emptyCapture: Card[] = [];
    const score = calculateScore(emptyCapture);
    expect(score).toBe(0);
  });

  test('should handle single card score', async () => {
    const singleCard: Card[] = [
      createTestCard('january-pi', Month.January, CardType.Pi),
    ];
    const score = calculateScore(singleCard);
    expect(score).toBe(0);
  });

  test('should verify 7-point threshold for go/stop', async () => {
    const gwangCards: Card[] = [
      createTestCard('january-gwang', Month.January, CardType.Gwang),
      createTestCard('march-gwang', Month.March, CardType.Gwang),
      createTestCard('august-gwang', Month.August, CardType.Gwang),
    ];

    const score = calculateScore(gwangCards);
    expect(score).toBeGreaterThanOrEqual(7);
  });

  test('should calculate hongdan combo score', async () => {
    const hongdanCards: Card[] = [
      createTestCard('january-tti', Month.January, CardType.Tti),
      createTestCard('february-tti', Month.February, CardType.Tti),
      createTestCard('march-tti', Month.March, CardType.Tti),
    ];

    const combos = getCombos(hongdanCards);
    const comboScore = getComboScore(combos);

    expect(combos).toContain('hongdan');
    expect(comboScore).toBe(5);
  });

  test('should calculate multiple combo scores', async () => {
    const multiComboCards: Card[] = [
      createTestCard('february-yeol', Month.February, CardType.Yeol),
      createTestCard('april-yeol', Month.April, CardType.Yeol),
      createTestCard('august-yeol', Month.August, CardType.Yeol),
      createTestCard('january-tti', Month.January, CardType.Tti),
      createTestCard('february-tti', Month.February, CardType.Tti),
      createTestCard('march-tti', Month.March, CardType.Tti),
    ];

    const combos = getCombos(multiComboCards);
    const comboScore = getComboScore(combos);

    expect(combos.length).toBe(2);
    expect(comboScore).toBe(10);
  });
});
