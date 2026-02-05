import { describe, it, expect } from 'vitest';
import { createDeck, shuffle, dealCards } from '../game/deck';
import { CARDS } from '../game/cards';

describe('Deck Utilities', () => {
  describe('createDeck', () => {
    it('should return exactly 48 cards', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(48);
    });

    it('should return a copy of CARDS constant', () => {
      const deck = createDeck();
      expect(deck).toEqual(CARDS);
    });

    it('should not return the same reference as CARDS', () => {
      const deck = createDeck();
      expect(deck).not.toBe(CARDS);
    });

    it('should contain all unique card IDs', () => {
      const deck = createDeck();
      const ids = deck.map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(48);
    });

    it('should preserve card properties', () => {
      const deck = createDeck();
      deck.forEach((card, index) => {
        expect(card).toEqual(CARDS[index]);
      });
    });
  });

  describe('shuffle', () => {
    it('should return an array with 48 cards', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      expect(shuffled).toHaveLength(48);
    });

    it('should not modify the original deck', () => {
      const deck = createDeck();
      const originalDeck = [...deck];
      shuffle(deck);
      expect(deck).toEqual(originalDeck);
    });

    it('should return a different array reference', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      expect(shuffled).not.toBe(deck);
    });

    it('should contain all the same cards as the original', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      
      const originalIds = new Set(deck.map(card => card.id));
      const shuffledIds = new Set(shuffled.map(card => card.id));
      
      expect(shuffledIds).toEqual(originalIds);
    });

    it('should produce different results on multiple calls', () => {
      const deck = createDeck();
      const shuffled1 = shuffle(deck);
      const shuffled2 = shuffle(deck);
      
      // Very unlikely to be identical after shuffle
      const ids1 = shuffled1.map(card => card.id).join(',');
      const ids2 = shuffled2.map(card => card.id).join(',');
      
      expect(ids1).not.toBe(ids2);
    });

    it('should maintain card integrity after shuffle', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      
      shuffled.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('month');
        expect(card).toHaveProperty('type');
        expect(card).toHaveProperty('imagePath');
      });
    });
  });

  describe('dealCards', () => {
    it('should return an object with playerHand, aiHand, field, and deck properties', () => {
      const deck = createDeck();
      const dealt = dealCards(deck);
      
      expect(dealt).toHaveProperty('playerHand');
      expect(dealt).toHaveProperty('aiHand');
      expect(dealt).toHaveProperty('field');
      expect(dealt).toHaveProperty('deck');
    });

    it('should deal 10 cards to player', () => {
      const deck = createDeck();
      const dealt = dealCards(deck);
      expect(dealt.playerHand).toHaveLength(10);
    });

    it('should deal 10 cards to AI', () => {
      const deck = createDeck();
      const dealt = dealCards(deck);
      expect(dealt.aiHand).toHaveLength(10);
    });

    it('should place 8 cards on field', () => {
      const deck = createDeck();
      const dealt = dealCards(deck);
      expect(dealt.field).toHaveLength(8);
    });

    it('should leave 20 cards in deck', () => {
      const deck = createDeck();
      const dealt = dealCards(deck);
      expect(dealt.deck).toHaveLength(20);
    });

    it('should distribute all 48 cards correctly (10+10+8+20=48)', () => {
      const deck = createDeck();
      const dealt = dealCards(deck);
      
      const totalCards = 
        dealt.playerHand.length + 
        dealt.aiHand.length + 
        dealt.field.length + 
        dealt.deck.length;
      
      expect(totalCards).toBe(48);
    });

    it('should not have duplicate cards across all hands and field', () => {
      const deck = createDeck();
      const dealt = dealCards(deck);
      
      const allCards = [
        ...dealt.playerHand,
        ...dealt.aiHand,
        ...dealt.field,
        ...dealt.deck,
      ];
      
      const ids = allCards.map(card => card.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(48);
    });

    it('should not modify the original deck array', () => {
      const deck = createDeck();
      const originalDeck = [...deck];
      dealCards(deck);
      expect(deck).toEqual(originalDeck);
    });

    it('should return arrays that are not references to the original deck', () => {
      const deck = createDeck();
      const dealt = dealCards(deck);
      
      expect(dealt.playerHand).not.toBe(deck);
      expect(dealt.aiHand).not.toBe(deck);
      expect(dealt.field).not.toBe(deck);
      expect(dealt.deck).not.toBe(deck);
    });

    it('should work with shuffled deck', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      const dealt = dealCards(shuffled);
      
      expect(dealt.playerHand).toHaveLength(10);
      expect(dealt.aiHand).toHaveLength(10);
      expect(dealt.field).toHaveLength(8);
      expect(dealt.deck).toHaveLength(20);
    });
  });

  describe('Integration', () => {
    it('should handle full game setup: create -> shuffle -> deal', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      const dealt = dealCards(shuffled);
      
      expect(dealt.playerHand).toHaveLength(10);
      expect(dealt.aiHand).toHaveLength(10);
      expect(dealt.field).toHaveLength(8);
      expect(dealt.deck).toHaveLength(20);
      
      const totalCards = 
        dealt.playerHand.length + 
        dealt.aiHand.length + 
        dealt.field.length + 
        dealt.deck.length;
      expect(totalCards).toBe(48);
    });

    it('should maintain immutability throughout the process', () => {
      const deck = createDeck();
      const originalDeck = [...deck];
      
      const shuffled = shuffle(deck);
      expect(deck).toEqual(originalDeck);
      
      const originalShuffled = [...shuffled];
      dealCards(shuffled);
      expect(shuffled).toEqual(originalShuffled);
    });
  });
});
