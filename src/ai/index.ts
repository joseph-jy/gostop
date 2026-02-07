import { type AiPlayer } from './types';
import * as easy from './easy';
import * as medium from './medium';
import * as hard from './hard';

export type Difficulty = 'easy' | 'medium' | 'hard';

export function createAiPlayer(difficulty: Difficulty): AiPlayer {
  switch (difficulty) {
    case 'easy':
      return easy;
    case 'medium':
      return medium;
    case 'hard':
      return hard;
  }
}
