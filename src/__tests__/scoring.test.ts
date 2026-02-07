import { describe, it, expect } from 'vitest';
import { Card, CardType, Month } from '../game/cards';
import {
  calculatePiScore,
  calculateGwangScore,
  calculateTtiScore,
  calculateYeolScore,
  calculateTotal,
  applyBonus,
  type CapturedCards,
  type PlayerScore,
} from '../game/scoring';

const createCard = (id: string, type: CardType, month: Month): Card => ({
  id,
  month,
  type,
  imagePath: `cards/${id}.png`,
});

describe('Pi Scoring (피)', () => {
  it('should return 0 for less than 10 pi cards', () => {
    const cards = Array.from({ length: 9 }, (_, i) =>
      createCard(`pi-${i}`, CardType.Pi, Month.January)
    );
    expect(calculatePiScore(cards)).toBe(0);
  });

  it('should return 1 for exactly 10 pi cards', () => {
    const cards = Array.from({ length: 10 }, (_, i) =>
      createCard(`pi-${i}`, CardType.Pi, Month.January)
    );
    expect(calculatePiScore(cards)).toBe(1);
  });

  it('should return 2 for 11 pi cards', () => {
    const cards = Array.from({ length: 11 }, (_, i) =>
      createCard(`pi-${i}`, CardType.Pi, Month.January)
    );
    expect(calculatePiScore(cards)).toBe(2);
  });

  it('should count 쌍피 (november-pi-1) as 2 cards', () => {
    const cards = [
      createCard('november-pi-1', CardType.Pi, Month.November),
      ...Array.from({ length: 8 }, (_, i) =>
        createCard(`pi-${i}`, CardType.Pi, Month.January)
      ),
    ];
    // 1 쌍피 (counts as 2) + 8 regular = 10 total → 1 point
    expect(calculatePiScore(cards)).toBe(1);
  });

  it('should count 쌍피 (december-pi-1) as 2 cards', () => {
    const cards = [
      createCard('december-pi-1', CardType.Pi, Month.December),
      ...Array.from({ length: 8 }, (_, i) =>
        createCard(`pi-${i}`, CardType.Pi, Month.January)
      ),
    ];
    // 1 쌍피 (counts as 2) + 8 regular = 10 total → 1 point
    expect(calculatePiScore(cards)).toBe(1);
  });

  it('should count both 쌍피 cards as 2 each', () => {
    const cards = [
      createCard('november-pi-1', CardType.Pi, Month.November),
      createCard('december-pi-1', CardType.Pi, Month.December),
      ...Array.from({ length: 7 }, (_, i) =>
        createCard(`pi-${i}`, CardType.Pi, Month.January)
      ),
    ];
    // 2 쌍피 (4) + 7 regular = 11 total → 2 points
    expect(calculatePiScore(cards)).toBe(2);
  });

  it('should ignore non-pi cards', () => {
    const cards = [
      ...Array.from({ length: 10 }, (_, i) =>
        createCard(`pi-${i}`, CardType.Pi, Month.January)
      ),
      createCard('gwang-1', CardType.Gwang, Month.January),
      createCard('tti-1', CardType.Tti, Month.January),
    ];
    expect(calculatePiScore(cards)).toBe(1);
  });
});

describe('Gwang Scoring (광)', () => {
  it('should return 0 for less than 3 gwang cards', () => {
    const cards = [
      createCard('january-gwang', CardType.Gwang, Month.January),
      createCard('march-gwang', CardType.Gwang, Month.March),
    ];
    expect(calculateGwangScore(cards)).toBe(0);
  });

  it('should return 3 points for 3 gwang without 비광', () => {
    const cards = [
      createCard('january-gwang', CardType.Gwang, Month.January),
      createCard('march-gwang', CardType.Gwang, Month.March),
      createCard('august-gwang', CardType.Gwang, Month.August),
    ];
    expect(calculateGwangScore(cards)).toBe(3);
  });

  it('should return 2 points for 3 gwang with 비광 (december-gwang)', () => {
    const cards = [
      createCard('january-gwang', CardType.Gwang, Month.January),
      createCard('march-gwang', CardType.Gwang, Month.March),
      createCard('december-gwang', CardType.Gwang, Month.December),
    ];
    expect(calculateGwangScore(cards)).toBe(2);
  });

  it('should return 4 points for 4 gwang', () => {
    const cards = [
      createCard('january-gwang', CardType.Gwang, Month.January),
      createCard('march-gwang', CardType.Gwang, Month.March),
      createCard('august-gwang', CardType.Gwang, Month.August),
      createCard('november-gwang', CardType.Gwang, Month.November),
    ];
    expect(calculateGwangScore(cards)).toBe(4);
  });

  it('should return 15 points for 5 gwang', () => {
    const cards = [
      createCard('january-gwang', CardType.Gwang, Month.January),
      createCard('march-gwang', CardType.Gwang, Month.March),
      createCard('august-gwang', CardType.Gwang, Month.August),
      createCard('november-gwang', CardType.Gwang, Month.November),
      createCard('december-gwang', CardType.Gwang, Month.December),
    ];
    expect(calculateGwangScore(cards)).toBe(15);
  });

  it('should ignore non-gwang cards', () => {
    const cards = [
      createCard('january-gwang', CardType.Gwang, Month.January),
      createCard('march-gwang', CardType.Gwang, Month.March),
      createCard('august-gwang', CardType.Gwang, Month.August),
      createCard('pi-1', CardType.Pi, Month.January),
      createCard('tti-1', CardType.Tti, Month.January),
    ];
    expect(calculateGwangScore(cards)).toBe(3);
  });
});

describe('Tti Scoring (띠)', () => {
  it('should return 0 for less than 5 tti cards', () => {
    const cards = Array.from({ length: 4 }, (_, i) =>
      createCard(`tti-${i}`, CardType.Tti, Month.January)
    );
    expect(calculateTtiScore(cards)).toBe(0);
  });

  it('should return 1 for exactly 5 tti cards', () => {
    const cards = Array.from({ length: 5 }, (_, i) =>
      createCard(`tti-${i}`, CardType.Tti, Month.January)
    );
    expect(calculateTtiScore(cards)).toBe(1);
  });

  it('should return 2 for 6 tti cards', () => {
    const cards = Array.from({ length: 6 }, (_, i) =>
      createCard(`tti-${i}`, CardType.Tti, Month.January)
    );
    expect(calculateTtiScore(cards)).toBe(2);
  });

  it('should ignore non-tti cards', () => {
    const cards = [
      ...Array.from({ length: 5 }, (_, i) =>
        createCard(`tti-${i}`, CardType.Tti, Month.January)
      ),
      createCard('gwang-1', CardType.Gwang, Month.January),
    ];
    expect(calculateTtiScore(cards)).toBe(1);
  });
});

describe('Yeol Scoring (열끗)', () => {
  it('should return 0 for less than 5 yeol cards', () => {
    const cards = Array.from({ length: 4 }, (_, i) =>
      createCard(`yeol-${i}`, CardType.Yeol, Month.January)
    );
    expect(calculateYeolScore(cards)).toBe(0);
  });

  it('should return 1 for exactly 5 yeol cards', () => {
    const cards = Array.from({ length: 5 }, (_, i) =>
      createCard(`yeol-${i}`, CardType.Yeol, Month.January)
    );
    expect(calculateYeolScore(cards)).toBe(1);
  });

  it('should return 2 for 6 yeol cards', () => {
    const cards = Array.from({ length: 6 }, (_, i) =>
      createCard(`yeol-${i}`, CardType.Yeol, Month.January)
    );
    expect(calculateYeolScore(cards)).toBe(2);
  });

  it('should ignore non-yeol cards', () => {
    const cards = [
      ...Array.from({ length: 5 }, (_, i) =>
        createCard(`yeol-${i}`, CardType.Yeol, Month.January)
      ),
      createCard('gwang-1', CardType.Gwang, Month.January),
    ];
    expect(calculateYeolScore(cards)).toBe(1);
  });
});

describe('Total Score Calculation', () => {
  it('should sum all category scores', () => {
    const capture: CapturedCards = {
      gwang: [
        createCard('january-gwang', CardType.Gwang, Month.January),
        createCard('march-gwang', CardType.Gwang, Month.March),
        createCard('august-gwang', CardType.Gwang, Month.August),
      ],
      yeol: Array.from({ length: 5 }, (_, i) =>
        createCard(`yeol-${i}`, CardType.Yeol, Month.January)
      ),
      tti: Array.from({ length: 5 }, (_, i) =>
        createCard(`tti-${i}`, CardType.Tti, Month.January)
      ),
      pi: Array.from({ length: 10 }, (_, i) =>
        createCard(`pi-${i}`, CardType.Pi, Month.January)
      ),
    };

    const total = calculateTotal(capture);
    // Gwang: 3, Yeol: 1, Tti: 1, Pi: 1 = 6
    expect(total).toEqual({
      gwang: 3,
      yeol: 1,
      tti: 1,
      pi: 1,
      total: 6,
    });
  });

  it('should handle zero scores', () => {
    const capture: CapturedCards = {
      gwang: [],
      yeol: [],
      tti: [],
      pi: [],
    };

    const total = calculateTotal(capture);
    expect(total).toEqual({
      gwang: 0,
      yeol: 0,
      tti: 0,
      pi: 0,
      total: 0,
    });
  });
});

describe('Bonus Multipliers', () => {
  const basePlayerCapture: CapturedCards = {
    gwang: [
      createCard('january-gwang', CardType.Gwang, Month.January),
      createCard('march-gwang', CardType.Gwang, Month.March),
      createCard('august-gwang', CardType.Gwang, Month.August),
    ],
    yeol: Array.from({ length: 5 }, (_, i) =>
      createCard(`yeol-${i}`, CardType.Yeol, Month.January)
    ),
    tti: Array.from({ length: 5 }, (_, i) =>
      createCard(`tti-${i}`, CardType.Tti, Month.January)
    ),
    pi: Array.from({ length: 10 }, (_, i) =>
      createCard(`pi-${i}`, CardType.Pi, Month.January)
    ),
  };

  const basePlayerScore: PlayerScore = {
    gwang: 3,
    yeol: 1,
    tti: 1,
    pi: 1,
    total: 6,
  };

  describe('피박 (Pibak)', () => {
    it('should apply 2x multiplier when opponent pi score is 0', () => {
      const opponentCapture: CapturedCards = {
        gwang: [
          createCard('january-gwang', CardType.Gwang, Month.January),
          createCard('march-gwang', CardType.Gwang, Month.March),
          createCard('august-gwang', CardType.Gwang, Month.August),
        ],
        yeol: [createCard('yeol-1', CardType.Yeol, Month.January)],
        tti: [],
        pi: Array.from({ length: 5 }, (_, i) =>
          createCard(`pi-${i}`, CardType.Pi, Month.January)
        ), // < 10 pi = 0 score
      };
      const opponentScore: PlayerScore = {
        gwang: 3,
        yeol: 0,
        tti: 0,
        pi: 0,
        total: 3,
      };

      const result = applyBonus(
        basePlayerScore,
        opponentScore,
        basePlayerCapture,
        opponentCapture
      );
      expect(result.finalScore).toBe(12); // 6 * 2
      expect(result.bonuses).toContain('피박');
    });

    it('should not apply 피박 when opponent has pi score', () => {
      const opponentCapture: CapturedCards = {
        gwang: [
          createCard('january-gwang', CardType.Gwang, Month.January),
          createCard('march-gwang', CardType.Gwang, Month.March),
          createCard('august-gwang', CardType.Gwang, Month.August),
        ],
        yeol: [createCard('yeol-1', CardType.Yeol, Month.January)],
        tti: [],
        pi: Array.from({ length: 10 }, (_, i) =>
          createCard(`pi-${i}`, CardType.Pi, Month.January)
        ), // 10 pi = 1 score
      };
      const opponentScore: PlayerScore = {
        gwang: 3,
        yeol: 0,
        tti: 0,
        pi: 1,
        total: 4,
      };

      const result = applyBonus(
        basePlayerScore,
        opponentScore,
        basePlayerCapture,
        opponentCapture
      );
      expect(result.finalScore).toBe(6);
      expect(result.bonuses).not.toContain('피박');
    });
  });

  describe('광박 (Gwangbak)', () => {
    it('should apply 2x multiplier when opponent gwang score is 0', () => {
      const opponentCapture: CapturedCards = {
        gwang: [],
        yeol: [createCard('yeol-1', CardType.Yeol, Month.January)],
        tti: [],
        pi: Array.from({ length: 10 }, (_, i) =>
          createCard(`pi-${i}`, CardType.Pi, Month.January)
        ),
      };
      const opponentScore: PlayerScore = {
        gwang: 0,
        yeol: 0,
        tti: 0,
        pi: 1,
        total: 1,
      };

      const result = applyBonus(
        basePlayerScore,
        opponentScore,
        basePlayerCapture,
        opponentCapture
      );
      expect(result.finalScore).toBe(12); // 6 * 2
      expect(result.bonuses).toContain('광박');
    });

    it('should not apply 광박 when opponent has gwang score', () => {
      const opponentCapture: CapturedCards = {
        gwang: [
          createCard('january-gwang', CardType.Gwang, Month.January),
          createCard('march-gwang', CardType.Gwang, Month.March),
          createCard('august-gwang', CardType.Gwang, Month.August),
        ],
        yeol: [createCard('yeol-1', CardType.Yeol, Month.January)],
        tti: [],
        pi: Array.from({ length: 10 }, (_, i) =>
          createCard(`pi-${i}`, CardType.Pi, Month.January)
        ),
      };
      const opponentScore: PlayerScore = {
        gwang: 3,
        yeol: 0,
        tti: 0,
        pi: 1,
        total: 4,
      };

      const result = applyBonus(
        basePlayerScore,
        opponentScore,
        basePlayerCapture,
        opponentCapture
      );
      expect(result.finalScore).toBe(6);
      expect(result.bonuses).not.toContain('광박');
    });
  });

  describe('멍텅구리 (Meongteongguri)', () => {
    it('should apply 2x multiplier when opponent has 0 yeol and player wins', () => {
      const opponentCapture: CapturedCards = {
        gwang: [
          createCard('january-gwang', CardType.Gwang, Month.January),
          createCard('march-gwang', CardType.Gwang, Month.March),
          createCard('august-gwang', CardType.Gwang, Month.August),
        ],
        yeol: [], // 0 yeol
        tti: [],
        pi: Array.from({ length: 10 }, (_, i) =>
          createCard(`pi-${i}`, CardType.Pi, Month.January)
        ),
      };
      const opponentScore: PlayerScore = {
        gwang: 3,
        yeol: 0,
        tti: 0,
        pi: 1,
        total: 4,
      };

      const result = applyBonus(
        basePlayerScore,
        opponentScore,
        basePlayerCapture,
        opponentCapture
      );
      expect(result.finalScore).toBe(12); // 6 * 2
      expect(result.bonuses).toContain('멍텅구리');
    });

    it('should not apply 멍텅구리 when opponent has yeol', () => {
      const opponentCapture: CapturedCards = {
        gwang: [
          createCard('january-gwang', CardType.Gwang, Month.January),
          createCard('march-gwang', CardType.Gwang, Month.March),
          createCard('august-gwang', CardType.Gwang, Month.August),
        ],
        yeol: [createCard('yeol-1', CardType.Yeol, Month.January)], // Has yeol
        tti: [],
        pi: Array.from({ length: 10 }, (_, i) =>
          createCard(`pi-${i}`, CardType.Pi, Month.January)
        ),
      };
      const opponentScore: PlayerScore = {
        gwang: 3,
        yeol: 0,
        tti: 0,
        pi: 1,
        total: 4,
      };

      const result = applyBonus(
        basePlayerScore,
        opponentScore,
        basePlayerCapture,
        opponentCapture
      );
      expect(result.finalScore).toBe(6);
      expect(result.bonuses).not.toContain('멍텅구리');
    });
  });

  describe('Multiple Bonuses (Stacking)', () => {
    it('should stack 피박 and 광박 (2 * 2 = 4x)', () => {
      const opponentCapture: CapturedCards = {
        gwang: [], // No gwang → 광박
        yeol: [createCard('yeol-1', CardType.Yeol, Month.January)],
        tti: [],
        pi: [], // No pi (< 10) → 피박
      };
      const opponentScore: PlayerScore = {
        gwang: 0,
        yeol: 0,
        tti: 0,
        pi: 0,
        total: 0,
      };

      const result = applyBonus(
        basePlayerScore,
        opponentScore,
        basePlayerCapture,
        opponentCapture
      );
      expect(result.finalScore).toBe(24); // 6 * 2 * 2
      expect(result.bonuses).toContain('피박');
      expect(result.bonuses).toContain('광박');
    });

    it('should stack all three bonuses (2 * 2 * 2 = 8x)', () => {
      const opponentCapture: CapturedCards = {
        gwang: [], // No gwang → 광박
        yeol: [], // No yeol → 멍텅구리
        tti: [],
        pi: [], // No pi (< 10) → 피박
      };
      const opponentScore: PlayerScore = {
        gwang: 0,
        yeol: 0,
        tti: 0,
        pi: 0,
        total: 0,
      };

      const result = applyBonus(
        basePlayerScore,
        opponentScore,
        basePlayerCapture,
        opponentCapture
      );
      expect(result.finalScore).toBe(48); // 6 * 2 * 2 * 2
      expect(result.bonuses).toContain('피박');
      expect(result.bonuses).toContain('광박');
      expect(result.bonuses).toContain('멍텅구리');
    });
  });
});
