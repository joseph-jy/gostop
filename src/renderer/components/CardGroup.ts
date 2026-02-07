import { Card, CardType } from '../../game/cards';
import CardComponent from './Card';

export interface CardGroupProps {
  cards: Card[];
  onClick?: (card: Card) => void;
  isSelectable?: boolean;
}

const CSS = {
  root: 'card-group',
  container: 'card-group__container',
  typeSection: 'card-group__type-section',
} as const;

export default class CardGroup {
  private readonly el: HTMLElement;
  private readonly containerEl: HTMLElement;
  private cardComponents: CardComponent[] = [];
  private props: CardGroupProps;

  constructor(props: CardGroupProps) {
    this.props = { ...props };

    this.el = document.createElement('div');
    this.el.className = CSS.root;

    this.containerEl = document.createElement('div');
    this.containerEl.className = CSS.container;
    this.el.appendChild(this.containerEl);

    this.render();
  }

  getElement(): HTMLElement {
    return this.el;
  }

  getCardComponents(): CardComponent[] {
    return [...this.cardComponents];
  }

  update(next: Partial<CardGroupProps>): void {
    this.props = { ...this.props, ...next };
    this.render();
  }

  destroy(): void {
    this.destroyComponents();
    this.el.remove();
  }

  private render(): void {
    this.destroyComponents();
    this.containerEl.innerHTML = '';

    const groupedCards = this.groupCardsByType(this.props.cards);

    const typeOrder: CardType[] = [CardType.Gwang, CardType.Yeol, CardType.Tti, CardType.Pi];

    for (const type of typeOrder) {
      const cards = groupedCards.get(type);
      if (!cards || cards.length === 0) continue;

      const sectionEl = document.createElement('div');
      sectionEl.className = CSS.typeSection;

      const rowEl = document.createElement('div');
      rowEl.style.display = 'flex';
      rowEl.style.gap = 'var(--space-sm)';
      rowEl.style.flexWrap = 'wrap';

      for (const card of cards) {
        const comp = new CardComponent({
          card,
          onClick: this.props.onClick,
          isSelectable: this.props.isSelectable,
        });
        this.cardComponents.push(comp);
        rowEl.appendChild(comp.getElement());
      }

      sectionEl.appendChild(rowEl);
      this.containerEl.appendChild(sectionEl);
    }
  }

  private groupCardsByType(cards: Card[]): Map<CardType, Card[]> {
    const grouped = new Map<CardType, Card[]>();

    for (const card of cards) {
      const existing = grouped.get(card.type) ?? [];
      grouped.set(card.type, [...existing, card]);
    }

    return grouped;
  }

  private destroyComponents(): void {
    for (const comp of this.cardComponents) {
      comp.destroy();
    }
    this.cardComponents = [];
  }
}
