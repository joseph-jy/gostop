import { test, expect } from '@playwright/test';
import { Card, CardType, Month } from '../src/game/cards';
import { detectJjok, detectPpuk, detectBomb, detectChongtong, canShake, applyJjok, applyPpuk, applyBomb, applyChongtong, applyShake } from '../src/game/special-rules';
import { canGoOrStop, selectGo, selectStop, calculateGoMultiplier } from '../src/game/go-stop';
import { createInitialState, calculateScore } from '../src/game/state';
import { shuffle, DealResult } from '../src/game/deck';
import { CARDS } from '../src/game/cards';

function createTestCard(id: string, month: Month, type: CardType): Card {
  return {
    id,
    month,
    type,
    imagePath: `test-${id}.png`,
  };
}

function createDealResult(): DealResult {
  const shuffled = shuffle(CARDS);
  return {
    playerHand: shuffled.slice(0, 10),
    aiHand: shuffled.slice(10, 20),
    field: shuffled.slice(20, 28),
    deck: shuffled.slice(28, 48),
  };
}

test.describe('Edge Case Tests', () => {
  test.describe('Jjok (쪽) - Triple Capture', () => {
    test('should detect jjok when field has 2 same-month cards', async () => {
      const playCard = createTestCard('january-gwang', Month.January, CardType.Gwang);
      const field: Card[] = [
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
        createTestCard('february-yeol', Month.February, CardType.Yeol),
      ];

      const isJjok = detectJjok(playCard, field);
      expect(isJjok).toBe(true);
    });

    test('should apply jjok and steal opponent pi', async () => {
      const playCard = createTestCard('january-gwang', Month.January, CardType.Gwang);
      const field: Card[] = [
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
      ];
      const opponentPi: Card[] = [
        createTestCard('opponent-pi', Month.February, CardType.Pi),
      ];

      const result = applyJjok(playCard, field, opponentPi);

      expect(result.captured.length).toBe(3);
      expect(result.stolenPi.length).toBe(1);
      expect(result.remainingField.length).toBe(0);
    });

    test('should handle jjok without opponent pi', async () => {
      const playCard = createTestCard('january-gwang', Month.January, CardType.Gwang);
      const field: Card[] = [
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
      ];

      const result = applyJjok(playCard, field, []);

      expect(result.captured.length).toBe(3);
      expect(result.stolenPi.length).toBe(0);
    });
  });

  test.describe('Ppuk (뻑) - Quad Capture', () => {
    test('should detect ppuk when field has 3 same-month cards', async () => {
      const playCard = createTestCard('january-gwang', Month.January, CardType.Gwang);
      const field: Card[] = [
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
        createTestCard('january-pi-2', Month.January, CardType.Pi),
      ];

      const isPpuk = detectPpuk(playCard, field);
      expect(isPpuk).toBe(true);
    });

    test('should apply ppuk and capture all 4 cards', async () => {
      const playCard = createTestCard('january-gwang', Month.January, CardType.Gwang);
      const field: Card[] = [
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
        createTestCard('january-pi-2', Month.January, CardType.Pi),
        createTestCard('february-yeol', Month.February, CardType.Yeol),
      ];

      const result = applyPpuk(playCard, field);

      expect(result.captured.length).toBe(4);
      expect(result.remainingField.length).toBe(1);
    });
  });

  test.describe('Bomb (폭탄) - Hand Triple', () => {
    test('should detect bomb when hand has 3 same-month cards', async () => {
      const hand: Card[] = [
        createTestCard('january-gwang', Month.January, CardType.Gwang),
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
        createTestCard('february-yeol', Month.February, CardType.Yeol),
      ];

      const bombMonths = detectBomb(hand);
      expect(bombMonths.length).toBe(1);
      expect(bombMonths[0]).toBe(Month.January);
    });

    test('should apply bomb and steal opponent pi', async () => {
      const hand: Card[] = [
        createTestCard('january-gwang', Month.January, CardType.Gwang),
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
      ];
      const field: Card[] = [
        createTestCard('january-pi-2', Month.January, CardType.Pi),
      ];
      const opponentPi: Card[] = [
        createTestCard('opponent-pi', Month.February, CardType.Pi),
      ];

      const result = applyBomb(Month.January, hand, field, opponentPi);

      expect(result.captured.length).toBe(4);
      expect(result.stolenPi.length).toBe(1);
    });

    test('should detect multiple bombs', async () => {
      const hand: Card[] = [
        createTestCard('january-gwang', Month.January, CardType.Gwang),
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
        createTestCard('february-gwang', Month.February, CardType.Gwang),
        createTestCard('february-tti', Month.February, CardType.Tti),
        createTestCard('february-pi-1', Month.February, CardType.Pi),
      ];

      const bombMonths = detectBomb(hand);
      expect(bombMonths.length).toBe(2);
    });
  });

  test.describe('Chongtong (총통) - Hand Quad', () => {
    test('should detect chongtong when hand has 4 same-month cards', async () => {
      const hand: Card[] = [
        createTestCard('january-gwang', Month.January, CardType.Gwang),
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
        createTestCard('january-pi-2', Month.January, CardType.Pi),
      ];

      const chongtongMonths = detectChongtong(hand);
      expect(chongtongMonths.length).toBe(1);
      expect(chongtongMonths[0]).toBe(Month.January);
    });

    test('should apply chongtong and steal 2 opponent pi', async () => {
      const hand: Card[] = [
        createTestCard('january-gwang', Month.January, CardType.Gwang),
        createTestCard('january-tti', Month.January, CardType.Tti),
        createTestCard('january-pi-1', Month.January, CardType.Pi),
        createTestCard('january-pi-2', Month.January, CardType.Pi),
      ];
      const opponentPi: Card[] = [
        createTestCard('opponent-pi-1', Month.February, CardType.Pi),
        createTestCard('opponent-pi-2', Month.March, CardType.Pi),
      ];

      const result = applyChongtong(Month.January, hand, opponentPi);

      expect(result.captured.length).toBe(4);
      expect(result.stolenPi.length).toBe(2);
    });
  });

  test.describe('Shake (흔들기) - Multiplier Bet', () => {
    test('should detect shake opportunity', async () => {
      const playCard = createTestCard('january-gwang', Month.January, CardType.Gwang);
      const hand: Card[] = [
        createTestCard('january-tti', Month.January, CardType.Tti),
      ];
      const field: Card[] = [
        createTestCard('january-pi-1', Month.January, CardType.Pi),
        createTestCard('january-pi-2', Month.January, CardType.Pi),
      ];

      const canDoShake = canShake(playCard, hand, field);
      expect(canDoShake).toBe(true);
    });

    test('should double multiplier on successful shake', async () => {
      const result = applyShake(true, 1);
      expect(result.multiplier).toBe(2);
      expect(result.success).toBe(true);
    });

    test('should reset multiplier on failed shake', async () => {
      const result = applyShake(false, 4);
      expect(result.multiplier).toBe(1);
      expect(result.success).toBe(false);
    });

    test('should stack multiple successful shakes', async () => {
      let currentMultiplier = 1;

      const result1 = applyShake(true, currentMultiplier);
      currentMultiplier = result1.multiplier;
      expect(currentMultiplier).toBe(2);

      const result2 = applyShake(true, currentMultiplier);
      currentMultiplier = result2.multiplier;
      expect(currentMultiplier).toBe(4);

      const result3 = applyShake(true, currentMultiplier);
      currentMultiplier = result3.multiplier;
      expect(currentMultiplier).toBe(8);
    });
  });

  test.describe('Go/Stop Decision', () => {
    test('should allow go/stop at 7 points', async () => {
      const canDecide = canGoOrStop(7);
      expect(canDecide).toBe(true);
    });

    test('should not allow go/stop below 7 points', async () => {
      const canDecide = canGoOrStop(6);
      expect(canDecide).toBe(false);
    });

    test('should handle go decision', async () => {
      const deal = createDealResult();
      let state = createInitialState(deal);

      state.goCount = { player: 0, ai: 0 };
      state.currentTurn = 'player';

      const newState = selectGo(state);

      expect(newState.goCount.player).toBe(1);
      expect(newState.currentTurn).toBe('ai');
    });

    test('should handle stop decision', async () => {
      const deal = createDealResult();
      let state = createInitialState(deal);

      const newState = selectStop(state);

      expect(newState.phase).toBe('end');
    });

    test('should calculate go multiplier correctly', async () => {
      expect(calculateGoMultiplier(0)).toBe(1);
      expect(calculateGoMultiplier(1)).toBe(2);
      expect(calculateGoMultiplier(2)).toBe(4);
      expect(calculateGoMultiplier(3)).toBe(8);
    });
  });

  test.describe('Score Reversal (역전)', () => {
    test('should detect potential reversal scenario', async () => {
      const deal = createDealResult();
      let state = createInitialState(deal);

      state.goCount = { player: 1, ai: 0 };

      const gwangCards: Card[] = [
        createTestCard('january-gwang', Month.January, CardType.Gwang),
        createTestCard('march-gwang', Month.March, CardType.Gwang),
        createTestCard('august-gwang', Month.August, CardType.Gwang),
      ];

      const aiScore = calculateScore(gwangCards);

      expect(aiScore).toBeGreaterThanOrEqual(7);
      expect(state.goCount.player).toBeGreaterThan(0);
    });
  });

  test.describe('Empty Hand/Deck Scenarios', () => {
    test('should handle empty hand gracefully', async () => {
      const emptyHand: Card[] = [];
      const field: Card[] = [
        createTestCard('january-gwang', Month.January, CardType.Gwang),
      ];

      const bombMonths = detectBomb(emptyHand);
      expect(bombMonths.length).toBe(0);
    });

    test('should handle empty field', async () => {
      const playCard = createTestCard('january-gwang', Month.January, CardType.Gwang);
      const emptyField: Card[] = [];

      const isJjok = detectJjok(playCard, emptyField);
      expect(isJjok).toBe(false);
    });

    test('should handle zero capture pile', async () => {
      const emptyCapture: Card[] = [];
      const score = calculateScore(emptyCapture);
      expect(score).toBe(0);
    });
  });

  test.describe('Maximum Score Scenarios', () => {
    test('should handle high score scenarios', async () => {
      const maxCards: Card[] = [
        createTestCard('january-gwang', Month.January, CardType.Gwang),
        createTestCard('march-gwang', Month.March, CardType.Gwang),
        createTestCard('august-gwang', Month.August, CardType.Gwang),
        createTestCard('november-gwang', Month.November, CardType.Gwang),
        createTestCard('december-gwang', Month.December, CardType.Gwang),
      ];

      for (let i = 0; i < 9; i++) {
        maxCards.push(createTestCard(`yeol-${i}`, Month.January, CardType.Yeol));
      }

      for (let i = 0; i < 10; i++) {
        maxCards.push(createTestCard(`tti-${i}`, Month.January, CardType.Tti));
      }

      for (let i = 0; i < 15; i++) {
        maxCards.push(createTestCard(`pi-${i}`, Month.January, CardType.Pi));
      }

      const score = calculateScore(maxCards);
      expect(score).toBeGreaterThan(20);
    });
  });
});
