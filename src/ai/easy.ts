import { Card } from '../game/cards';
import { GameState } from '../game/state';
import { getValidMoves } from '../game/matching';

export function selectMove(
  _state: GameState,
  hand: Card[],
  _field: Card[],
  _knownCards: Card[]
): Card {
  const validMoves = getValidMoves(hand);
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
}

export function selectGoStop(
  _score: number,
  _myScore: number,
  _opponentScore: number,
  _expectedScore: number
): 'go' | 'stop' {
  return Math.random() < 0.3 ? 'go' : 'stop';
}
