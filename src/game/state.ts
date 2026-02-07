import { Card } from './cards';
import { DealResult } from './deck';
import { calculateGwangScore, calculateYeolScore, calculateTtiScore, calculatePiScore } from './scoring';
import { GO_STOP_THRESHOLD } from './constants';

export type Phase =
  | 'waiting'
  | 'select-hand'
  | 'match-hand'
  | 'flip-deck'
  | 'match-deck'
  | 'check-score'
  | 'go-stop'
  | 'end';

export type Turn = 'player' | 'ai';

export interface Action {
  type: string;
  payload?: unknown;
}

export interface GameState {
  playerHand: Card[];
  aiHand: Card[];
  field: Card[];
  deck: Card[];
  playerCapture: Card[];
  aiCapture: Card[];
  currentTurn: Turn;
  phase: Phase;
  goCount: { player: number; ai: number };
  selectedCard: Card | null;
  flippedCard: Card | null;
  lastAction: Action | null;
  shakingMultiplier: number;
}

export function createInitialState(dealResult: DealResult): GameState {
  return {
    playerHand: dealResult.playerHand,
    aiHand: dealResult.aiHand,
    field: dealResult.field,
    deck: dealResult.deck,
    playerCapture: [],
    aiCapture: [],
    currentTurn: 'player',
    phase: 'waiting',
    goCount: { player: 0, ai: 0 },
    selectedCard: null,
    flippedCard: null,
    lastAction: null,
    shakingMultiplier: 1,
  };
}

export function updateState(
  state: GameState,
  updates: Partial<GameState>
): GameState {
  return {
    ...state,
    ...updates,
  };
}

export function switchTurn(state: GameState): GameState {
  return {
    ...state,
    currentTurn: state.currentTurn === 'player' ? 'ai' : 'player',
    phase: 'select-hand',
    selectedCard: null,
    flippedCard: null,
  };
}

export function selectCard(state: GameState, card: Card): GameState {
  const newHand = state.playerHand.filter((c) => c.id !== card.id);
  
  return {
    ...state,
    playerHand: newHand,
    selectedCard: card,
  };
}

export function flipDeckCard(state: GameState): GameState {
  const [flippedCard, ...remainingDeck] = state.deck;
  
  return {
    ...state,
    deck: remainingDeck,
    flippedCard,
  };
}

export function calculateScore(capture: Card[]): number {
  return calculateGwangScore(capture) + calculateYeolScore(capture) + calculateTtiScore(capture) + calculatePiScore(capture);
}

export function shouldEnterGoStopPhase(state: GameState): boolean {
  const currentCapture = state.currentTurn === 'player' 
    ? state.playerCapture 
    : state.aiCapture;
  
  const score = calculateScore(currentCapture);
  
  return score >= GO_STOP_THRESHOLD;
}

export function advancePhase(state: GameState): GameState {
  const phaseTransitions: Record<Phase, Phase> = {
    'waiting': 'select-hand',
    'select-hand': 'match-hand',
    'match-hand': 'flip-deck',
    'flip-deck': 'match-deck',
    'match-deck': 'check-score',
    'check-score': 'select-hand',
    'go-stop': 'select-hand',
    'end': 'end',
  };
  
  if (state.phase === 'check-score') {
    if (shouldEnterGoStopPhase(state)) {
      return updateState(state, { phase: 'go-stop' });
    } else {
      return switchTurn(state);
    }
  }
  
  const nextPhase = phaseTransitions[state.phase];
  
  return updateState(state, { phase: nextPhase });
}
