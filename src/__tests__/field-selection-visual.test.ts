import { describe, expect, it } from 'vitest';
import { shouldShowDisabledStyleForFieldCard } from '../renderer/field-selection-visual';

describe('shouldShowDisabledStyleForFieldCard', () => {
  it('returns false for hint cards outside choice phase', () => {
    const result = shouldShowDisabledStyleForFieldCard({
      isChoicePhase: false,
      isChoiceCard: false,
      isHint: true,
    });

    expect(result).toBe(false);
  });

  it('returns true for non-hint cards outside choice phase', () => {
    const result = shouldShowDisabledStyleForFieldCard({
      isChoicePhase: false,
      isChoiceCard: false,
      isHint: false,
    });

    expect(result).toBe(true);
  });

  it('returns false for selectable cards in choice phase', () => {
    const result = shouldShowDisabledStyleForFieldCard({
      isChoicePhase: true,
      isChoiceCard: true,
      isHint: false,
    });

    expect(result).toBe(false);
  });

  it('returns true for non-selectable cards in choice phase', () => {
    const result = shouldShowDisabledStyleForFieldCard({
      isChoicePhase: true,
      isChoiceCard: false,
      isHint: true,
    });

    expect(result).toBe(true);
  });
});
