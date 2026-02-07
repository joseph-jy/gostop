import { Card } from '../game/cards';
import { GameState } from '../game/state';

export interface AiPlayer {
  selectMove(state: GameState, hand: Card[], field: Card[], knownCards: Card[]): Card;
  selectGoStop(score: number, myScore: number, opponentScore: number, expectedScore: number): 'go' | 'stop';
}
