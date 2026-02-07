import { Card } from './cards';

export type ComboName = 'godori' | 'hongdan' | 'cheongdan' | 'chodan';

// 고도리: 2월, 4월, 8월의 열끗(새/동물 카드)
const GODORI_IDS = ['february-bird', 'april-bird', 'august-animal'];

// 홍단: 1월, 2월, 3월의 띠
const HONGDAN_IDS = ['january-hongdan', 'february-hongdan', 'march-hongdan'];

// 청단: 6월, 9월, 10월의 띠
const CHEONGDAN_IDS = ['june-cheongdan', 'september-chodan', 'october-chodan'];

// 초단: 4월, 5월, 7월의 띠
const CHODAN_IDS = ['april-hongdan', 'may-hongdan', 'july-chodan'];

export function hasGodori(cards: Card[]): boolean {
  return GODORI_IDS.every(id => cards.some(card => card.id === id));
}

export function hasCheongdan(cards: Card[]): boolean {
  return CHEONGDAN_IDS.every(id => cards.some(card => card.id === id));
}

export function hasHongdan(cards: Card[]): boolean {
  return HONGDAN_IDS.every(id => cards.some(card => card.id === id));
}

export function hasChodan(cards: Card[]): boolean {
  return CHODAN_IDS.every(id => cards.some(card => card.id === id));
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
