import { Card } from './cards';

export type ComboName = 'godori' | 'hongdan' | 'cheongdan' | 'chodan';

export function hasGodori(cards: Card[]): boolean {
  const requiredCardIds = ['february-yeol', 'april-yeol', 'august-yeol'];
  return requiredCardIds.every(id => cards.some(card => card.id === id));
}

export function hasCheongdan(cards: Card[]): boolean {
  const requiredCardIds = ['june-tti', 'september-tti', 'october-tti'];
  return requiredCardIds.every(id => cards.some(card => card.id === id));
}

export function hasHongdan(cards: Card[]): boolean {
  const requiredCardIds = ['january-tti', 'february-tti', 'march-tti'];
  return requiredCardIds.every(id => cards.some(card => card.id === id));
}

export function hasChodan(cards: Card[]): boolean {
  const requiredCardIds = ['april-tti', 'may-tti', 'july-tti'];
  return requiredCardIds.every(id => cards.some(card => card.id === id));
}

export function getCombos(cards: Card[]): ComboName[] {
  const combos: ComboName[] = [];
  
  if (hasGodori(cards)) {
    combos.push('godori');
  }
  if (hasHongdan(cards)) {
    combos.push('hongdan');
  }
  if (hasChodan(cards)) {
    combos.push('chodan');
  }
  if (hasCheongdan(cards)) {
    combos.push('cheongdan');
  }
  
  return combos;
}

export function getComboScore(combos: ComboName[]): number {
  return combos.length * 5;
}
