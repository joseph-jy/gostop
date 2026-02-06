import { GameState, switchTurn, updateState } from './state';

export function canGoOrStop(score: number): boolean {
  return score >= 7;
}

export function selectGo(state: GameState): GameState {
  const currentPlayer = state.currentTurn;
  
  const newGoCount = {
    ...state.goCount,
    [currentPlayer]: state.goCount[currentPlayer] + 1,
  };
  
  const stateAfterGo = updateState(state, {
    goCount: newGoCount,
  });
  
  return switchTurn(stateAfterGo);
}

export function selectStop(state: GameState): GameState {
  return updateState(state, {
    phase: 'end',
  });
}

export function calculateGoMultiplier(goCount: number): number {
  return Math.pow(2, goCount);
}

export function handleReversal(
  state: GameState,
  _playerScore: number,
  _opponentGo: number
): GameState {
  return state;
}
