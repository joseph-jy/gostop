import { describe, it, expect } from 'vitest';
import { CardType, Month } from '../game/cards';
import { calculateSettlement, type CapturedCards } from '../game/scoring';
import { createCard } from './test-helpers';
import { STANDARD_RULESET } from '../game/ruleset';

function emptyCapture(): CapturedCards {
  return { gwang: [], yeol: [], tti: [], pi: [] };
}

describe('calculateSettlement', () => {
  it('should apply pibak when loser has 5 or fewer pi', () => {
    const playerCapture: CapturedCards = {
      gwang: [
        createCard('january-gwang', Month.January, CardType.Gwang),
        createCard('march-gwang', Month.March, CardType.Gwang),
        createCard('august-gwang', Month.August, CardType.Gwang),
      ],
      yeol: [],
      tti: [],
      pi: [],
    };
    const aiCapture: CapturedCards = {
      ...emptyCapture(),
      pi: Array.from({ length: 5 }, (_, i) =>
        createCard(`pi-${i}`, Month.January, CardType.Pi),
      ),
    };

    const result = calculateSettlement({
      playerCapture,
      aiCapture,
      playerGoCount: 0,
      aiGoCount: 0,
      playerComboScore: 0,
      aiComboScore: 0,
      shakingMultiplier: 1,
      ruleSet: STANDARD_RULESET,
      declaredWinner: 'player',
    });

    expect(result.playerFinal).toBe(24);
    expect(result.winnerBonuses).toContain('피박');
  });

  it('should apply gobak when loser reached 3-go', () => {
    const result = calculateSettlement({
      playerCapture: {
        ...emptyCapture(),
        gwang: [
          createCard('january-gwang', Month.January, CardType.Gwang),
          createCard('march-gwang', Month.March, CardType.Gwang),
          createCard('august-gwang', Month.August, CardType.Gwang),
        ],
      },
      aiCapture: emptyCapture(),
      playerGoCount: 0,
      aiGoCount: 3,
      playerComboScore: 0,
      aiComboScore: 0,
      shakingMultiplier: 1,
      ruleSet: STANDARD_RULESET,
      declaredWinner: 'player',
      bakFlags: { player: false, ai: false },
    });

    expect(result.playerFinal).toBe(48);
  });

  it('should apply dokbak when loser is marked as dokbak owner', () => {
    const result = calculateSettlement({
      playerCapture: {
        ...emptyCapture(),
        gwang: [
          createCard('january-gwang', Month.January, CardType.Gwang),
          createCard('march-gwang', Month.March, CardType.Gwang),
          createCard('august-gwang', Month.August, CardType.Gwang),
        ],
      },
      aiCapture: emptyCapture(),
      playerGoCount: 0,
      aiGoCount: 0,
      playerComboScore: 0,
      aiComboScore: 0,
      shakingMultiplier: 1,
      ruleSet: STANDARD_RULESET,
      declaredWinner: 'player',
      dokbakOwner: 'ai',
    });

    expect(result.playerFinal).toBe(48);
  });

  it('should return nagari on tied totals when no declared winner', () => {
    const result = calculateSettlement({
      playerCapture: emptyCapture(),
      aiCapture: emptyCapture(),
      playerGoCount: 0,
      aiGoCount: 0,
      playerComboScore: 0,
      aiComboScore: 0,
      shakingMultiplier: 1,
      ruleSet: STANDARD_RULESET,
    });

    expect(result.isNagari).toBe(true);
    expect(result.playerFinal).toBe(0);
    expect(result.aiFinal).toBe(0);
  });
});
