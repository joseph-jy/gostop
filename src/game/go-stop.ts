import { GameState, switchTurn, updateState } from './state';
import { GO_STOP_THRESHOLD } from './constants';
import { RuleSet, STANDARD_RULESET } from './ruleset';

export function canGoOrStop(score: number): boolean {
  return score >= GO_STOP_THRESHOLD;
}

export function selectGo(state: GameState): GameState {
  const currentPlayer = state.currentTurn;
  
  const newGoCount = {
    ...state.goCount,
    [currentPlayer]: state.goCount[currentPlayer] + 1,
  };
  
  const stateAfterGo = updateState(state, {
    goCount: newGoCount,
    goHistory: [...state.goHistory, currentPlayer],
  });
  
  return switchTurn(stateAfterGo);
}

export function selectStop(state: GameState): GameState {
  return updateState(state, {
    phase: 'end',
  });
}

export function calculateGoMultiplier(
  goCount: number,
  ruleSet: RuleSet = STANDARD_RULESET
): number {
  return goCount >= ruleSet.goMultiplierFromCount ? 2 : 1;
}
