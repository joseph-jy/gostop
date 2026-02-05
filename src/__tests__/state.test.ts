import { describe, it, expect } from 'vitest';
import { 
  Phase, 
  createInitialState, 
  updateState,
  advancePhase,
  switchTurn,
  selectCard,
  flipDeckCard,
  shouldEnterGoStopPhase
} from '../game/state';
import { createDeck, dealCards } from '../game/deck';
import { Card, CardType, Month } from '../game/cards';

describe('Phase Type', () => {
  it('should have 8 valid phase values', () => {
    const validPhases: Phase[] = [
      'waiting',
      'select-hand',
      'match-hand',
      'flip-deck',
      'match-deck',
      'check-score',
      'go-stop',
      'end'
    ];
    
    expect(validPhases).toHaveLength(8);
  });
});

describe('createInitialState', () => {
  it('should create initial state with correct structure', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state).toHaveProperty('playerHand');
    expect(state).toHaveProperty('aiHand');
    expect(state).toHaveProperty('field');
    expect(state).toHaveProperty('deck');
    expect(state).toHaveProperty('playerCapture');
    expect(state).toHaveProperty('aiCapture');
    expect(state).toHaveProperty('currentTurn');
    expect(state).toHaveProperty('phase');
    expect(state).toHaveProperty('goCount');
    expect(state).toHaveProperty('selectedCard');
    expect(state).toHaveProperty('flippedCard');
    expect(state).toHaveProperty('lastAction');
    expect(state).toHaveProperty('shakingMultiplier');
  });
  
  it('should initialize with player hands from dealResult', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.playerHand).toEqual(dealResult.playerHand);
    expect(state.playerHand).toHaveLength(10);
  });
  
  it('should initialize with AI hands from dealResult', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.aiHand).toEqual(dealResult.aiHand);
    expect(state.aiHand).toHaveLength(10);
  });
  
  it('should initialize with field cards from dealResult', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.field).toEqual(dealResult.field);
    expect(state.field).toHaveLength(8);
  });
  
  it('should initialize with deck cards from dealResult', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.deck).toEqual(dealResult.deck);
    expect(state.deck).toHaveLength(20);
  });
  
  it('should initialize with empty capture arrays', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.playerCapture).toEqual([]);
    expect(state.aiCapture).toEqual([]);
  });
  
  it('should initialize with player turn', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.currentTurn).toBe('player');
  });
  
  it('should initialize with waiting phase', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.phase).toBe('waiting');
  });
  
  it('should initialize with zero go counts', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.goCount).toEqual({ player: 0, ai: 0 });
  });
  
  it('should initialize with null selected and flipped cards', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.selectedCard).toBeNull();
    expect(state.flippedCard).toBeNull();
  });
  
  it('should initialize with null lastAction', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.lastAction).toBeNull();
  });
  
  it('should initialize with shakingMultiplier of 1', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    expect(state.shakingMultiplier).toBe(1);
  });
});

describe('State Immutability', () => {
  it('should not mutate original state when updating', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const originalState = createInitialState(dealResult);
    const originalPhase = originalState.phase;
    
    const newState = updateState(originalState, { phase: 'select-hand' });
    
    expect(originalState.phase).toBe(originalPhase);
    expect(newState.phase).toBe('select-hand');
    expect(originalState).not.toBe(newState);
  });
  
  it('should create new array references for arrays', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const originalState = createInitialState(dealResult);
    
    const newCard: Card = {
      id: 'test-card',
      month: Month.January,
      type: CardType.Pi,
      imagePath: 'test.png'
    };
    
    const newState = updateState(originalState, { 
      playerCapture: [...originalState.playerCapture, newCard] 
    });
    
    expect(originalState.playerCapture).toHaveLength(0);
    expect(newState.playerCapture).toHaveLength(1);
    expect(originalState.playerCapture).not.toBe(newState.playerCapture);
  });
  
  it('should preserve unchanged properties', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const originalState = createInitialState(dealResult);
    
    const newState = updateState(originalState, { phase: 'select-hand' });
    
    expect(newState.currentTurn).toBe(originalState.currentTurn);
    expect(newState.playerHand).toBe(originalState.playerHand);
    expect(newState.shakingMultiplier).toBe(originalState.shakingMultiplier);
  });
});

describe('Turn Switching', () => {
  it('should switch from player to ai', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const newState = switchTurn(state);
    
    expect(state.currentTurn).toBe('player');
    expect(newState.currentTurn).toBe('ai');
  });
  
  it('should switch from ai to player', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    const aiState = updateState(state, { currentTurn: 'ai' });
    
    const newState = switchTurn(aiState);
    
    expect(aiState.currentTurn).toBe('ai');
    expect(newState.currentTurn).toBe('player');
  });
  
  it('should reset phase to select-hand when switching turn', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    const checkScoreState = updateState(state, { phase: 'check-score' });
    
    const newState = switchTurn(checkScoreState);
    
    expect(newState.phase).toBe('select-hand');
  });
  
  it('should clear selectedCard and flippedCard when switching turn', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const testCard: Card = {
      id: 'test-card',
      month: Month.January,
      type: CardType.Pi,
      imagePath: 'test.png'
    };
    
    const stateWithCards = updateState(state, { 
      selectedCard: testCard,
      flippedCard: testCard
    });
    
    const newState = switchTurn(stateWithCards);
    
    expect(newState.selectedCard).toBeNull();
    expect(newState.flippedCard).toBeNull();
  });
});

describe('Phase Transitions', () => {
  it('should advance from waiting to select-hand', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const newState = advancePhase(state);
    
    expect(state.phase).toBe('waiting');
    expect(newState.phase).toBe('select-hand');
  });
  
  it('should advance from select-hand to match-hand', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    const selectHandState = updateState(state, { phase: 'select-hand' });
    
    const newState = advancePhase(selectHandState);
    
    expect(newState.phase).toBe('match-hand');
  });
  
  it('should advance from match-hand to flip-deck', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    const matchHandState = updateState(state, { phase: 'match-hand' });
    
    const newState = advancePhase(matchHandState);
    
    expect(newState.phase).toBe('flip-deck');
  });
  
  it('should advance from flip-deck to match-deck', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    const flipDeckState = updateState(state, { phase: 'flip-deck' });
    
    const newState = advancePhase(flipDeckState);
    
    expect(newState.phase).toBe('match-deck');
  });
  
  it('should advance from match-deck to check-score', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    const matchDeckState = updateState(state, { phase: 'match-deck' });
    
    const newState = advancePhase(matchDeckState);
    
    expect(newState.phase).toBe('check-score');
  });
  
  it('should stay at end phase', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    const endState = updateState(state, { phase: 'end' });
    
    const newState = advancePhase(endState);
    
    expect(newState.phase).toBe('end');
  });
});

describe('Go-Stop Phase Logic', () => {
  it('should determine go-stop phase is needed when score >= 7', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const gwangCards: Card[] = [
      { id: 'january-gwang', month: Month.January, type: CardType.Gwang, imagePath: 'test.png' },
      { id: 'march-gwang', month: Month.March, type: CardType.Gwang, imagePath: 'test.png' },
      { id: 'august-gwang', month: Month.August, type: CardType.Gwang, imagePath: 'test.png' },
    ];
    
    const stateWithCapture = updateState(state, { 
      playerCapture: gwangCards,
      currentTurn: 'player'
    });
    
    const shouldEnter = shouldEnterGoStopPhase(stateWithCapture);
    
    expect(shouldEnter).toBe(true);
  });
  
  it('should determine go-stop phase is not needed when score < 7', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const piCards: Card[] = [
      { id: 'january-pi-1', month: Month.January, type: CardType.Pi, imagePath: 'test.png' },
    ];
    
    const stateWithCapture = updateState(state, { 
      playerCapture: piCards,
      currentTurn: 'player'
    });
    
    const shouldEnter = shouldEnterGoStopPhase(stateWithCapture);
    
    expect(shouldEnter).toBe(false);
  });
  
  it('should advance from check-score to go-stop when score >= 7', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const gwangCards: Card[] = [
      { id: 'january-gwang', month: Month.January, type: CardType.Gwang, imagePath: 'test.png' },
      { id: 'march-gwang', month: Month.March, type: CardType.Gwang, imagePath: 'test.png' },
      { id: 'august-gwang', month: Month.August, type: CardType.Gwang, imagePath: 'test.png' },
    ];
    
    const checkScoreState = updateState(state, { 
      phase: 'check-score',
      playerCapture: gwangCards,
      currentTurn: 'player'
    });
    
    const newState = advancePhase(checkScoreState);
    
    expect(newState.phase).toBe('go-stop');
  });
  
  it('should NOT advance to go-stop from check-score when score < 7', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const piCards: Card[] = [
      { id: 'january-pi-1', month: Month.January, type: CardType.Pi, imagePath: 'test.png' },
    ];
    
    const checkScoreState = updateState(state, { 
      phase: 'check-score',
      playerCapture: piCards,
      currentTurn: 'player'
    });
    
    const newState = advancePhase(checkScoreState);
    
    expect(newState.phase).toBe('select-hand');
    expect(newState.currentTurn).not.toBe(checkScoreState.currentTurn);
  });
});

describe('Card Selection', () => {
  it('should set selectedCard when selecting from hand', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const cardToSelect = state.playerHand[0];
    const newState = selectCard(state, cardToSelect);
    
    expect(newState.selectedCard).toEqual(cardToSelect);
  });
  
  it('should remove selected card from playerHand', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const cardToSelect = state.playerHand[0];
    const newState = selectCard(state, cardToSelect);
    
    expect(state.playerHand).toHaveLength(10);
    expect(newState.playerHand).toHaveLength(9);
    expect(newState.playerHand).not.toContain(cardToSelect);
  });
  
  it('should not mutate original hand when selecting card', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    const originalHandLength = state.playerHand.length;
    
    const cardToSelect = state.playerHand[0];
    selectCard(state, cardToSelect);
    
    expect(state.playerHand).toHaveLength(originalHandLength);
  });
});

describe('Deck Card Flipping', () => {
  it('should set flippedCard when flipping from deck', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const newState = flipDeckCard(state);
    
    expect(newState.flippedCard).not.toBeNull();
    expect(newState.flippedCard).toEqual(state.deck[0]);
  });
  
  it('should remove flipped card from deck', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    
    const cardToFlip = state.deck[0];
    const newState = flipDeckCard(state);
    
    expect(state.deck).toHaveLength(20);
    expect(newState.deck).toHaveLength(19);
    expect(newState.deck).not.toContain(cardToFlip);
  });
  
  it('should not mutate original deck when flipping card', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    const state = createInitialState(dealResult);
    const originalDeckLength = state.deck.length;
    
    flipDeckCard(state);
    
    expect(state.deck).toHaveLength(originalDeckLength);
  });
});

describe('Full Turn Sequence', () => {
  it('should follow complete turn sequence: waiting -> select-hand -> match-hand -> flip-deck -> match-deck -> check-score -> select-hand (next turn)', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    let state = createInitialState(dealResult);
    
    expect(state.phase).toBe('waiting');
    expect(state.currentTurn).toBe('player');
    
    state = advancePhase(state);
    expect(state.phase).toBe('select-hand');
    
    state = advancePhase(state);
    expect(state.phase).toBe('match-hand');
    
    state = advancePhase(state);
    expect(state.phase).toBe('flip-deck');
    
    state = advancePhase(state);
    expect(state.phase).toBe('match-deck');
    
    state = advancePhase(state);
    expect(state.phase).toBe('check-score');
    
    state = advancePhase(state);
    expect(state.phase).toBe('select-hand');
    expect(state.currentTurn).toBe('ai');
  });
  
  it('should follow go-stop sequence when score >= 7', () => {
    const deck = createDeck();
    const dealResult = dealCards(deck);
    let state = createInitialState(dealResult);
    
    const gwangCards: Card[] = [
      { id: 'january-gwang', month: Month.January, type: CardType.Gwang, imagePath: 'test.png' },
      { id: 'march-gwang', month: Month.March, type: CardType.Gwang, imagePath: 'test.png' },
      { id: 'august-gwang', month: Month.August, type: CardType.Gwang, imagePath: 'test.png' },
    ];
    
    state = updateState(state, { 
      playerCapture: gwangCards,
      phase: 'check-score',
      currentTurn: 'player'
    });
    
    state = advancePhase(state);
    expect(state.phase).toBe('go-stop');
    
    state = updateState(state, { phase: 'end' });
    expect(state.phase).toBe('end');
  });
});
