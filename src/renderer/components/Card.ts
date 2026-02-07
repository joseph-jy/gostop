import { Card, CardType } from '../../game/cards';

export interface CardComponentProps {
  card: Card;
  onClick?: (card: Card) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  isHint?: boolean;
}

const CSS = {
  root: 'card',
  selectable: 'card--selectable',
  selected: 'card--selected',
  disabled: 'card--disabled',
  hint: 'card--hint',
  image: 'card__image',
  typeBadge: 'card__type-badge',
} as const;

export default class CardComponent {
  private readonly el: HTMLButtonElement;
  private readonly imgEl: HTMLImageElement;
  private readonly badgeEl: HTMLSpanElement;

  private props: CardComponentProps;
  private boundHandleClick: () => void;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;

  constructor(props: CardComponentProps) {
    this.props = { ...props };

    this.el = document.createElement('button');
    this.el.className = CSS.root;
    this.el.type = 'button';

    this.imgEl = document.createElement('img');
    this.imgEl.className = CSS.image;
    this.imgEl.draggable = false;
    this.el.appendChild(this.imgEl);

    this.badgeEl = document.createElement('span');
    this.badgeEl.className = CSS.typeBadge;
    this.el.appendChild(this.badgeEl);

    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);

    this.el.addEventListener('click', this.boundHandleClick);
    this.el.addEventListener('keydown', this.boundHandleKeyDown);

    this.applyProps();
  }

  getElement(): HTMLButtonElement {
    return this.el;
  }

  update(next: Partial<CardComponentProps>): void {
    this.props = { ...this.props, ...next };
    this.applyProps();
  }

  destroy(): void {
    this.el.removeEventListener('click', this.boundHandleClick);
    this.el.removeEventListener('keydown', this.boundHandleKeyDown);
    this.el.remove();
  }

  getCard(): Card {
    return this.props.card;
  }

  private applyProps(): void {
    const { card, isSelectable = true, isSelected = false, isHint = false } = this.props;

    this.imgEl.src = card.imagePath;
    this.imgEl.alt = `${card.month}월 ${card.type} 카드`;

    this.badgeEl.textContent = CardComponent.getTypeBadgeLabel(card.type);

    this.el.dataset.cardId = card.id;
    this.el.dataset.cardType = card.type;
    this.el.dataset.cardMonth = String(card.month);

    this.el.classList.toggle(CSS.selectable, isSelectable);
    this.el.classList.toggle(CSS.selected, isSelected);
    this.el.classList.toggle(CSS.disabled, !isSelectable);
    this.el.classList.toggle(CSS.hint, isHint);

    this.el.disabled = !isSelectable;
    this.el.setAttribute('aria-pressed', String(isSelected));
    this.el.setAttribute(
      'aria-label',
      `${card.month}월 ${CardComponent.getTypeBadgeLabel(card.type)} 카드${isSelected ? ' (선택됨)' : ''}${isHint ? ' (맞출 수 있음)' : ''}`,
    );
  }

  private handleClick(): void {
    const { card, onClick, isSelectable = true } = this.props;
    if (!isSelectable || !onClick) return;
    onClick(card);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClick();
    }
  }

  private static getTypeBadgeLabel(type: CardType): string {
    switch (type) {
      case CardType.Gwang: return '광';
      case CardType.Yeol:  return '열';
      case CardType.Tti:   return '띠';
      case CardType.Pi:    return '피';
    }
  }
}
