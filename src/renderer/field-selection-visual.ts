export interface FieldCardVisualState {
  isChoicePhase: boolean;
  isChoiceCard: boolean;
  isHint: boolean;
}

export function shouldShowDisabledStyleForFieldCard(state: FieldCardVisualState): boolean {
  if (state.isChoicePhase) {
    return !state.isChoiceCard;
  }
  return !state.isHint;
}
