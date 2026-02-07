export interface StatsComponentProps {
  totalGames: number;
  wins: number;
  losses: number;
  highScore: number;
}

const CSS = {
  root: 'stats',
  title: 'stats__title',
  list: 'stats__list',
  item: 'stats__item',
  label: 'stats__label',
  value: 'stats__value',
} as const;

function formatWinRate(wins: number, totalGames: number): string {
  if (totalGames === 0) return '0.0';
  return ((wins / totalGames) * 100).toFixed(1);
}

export default class Stats {
  private readonly el: HTMLElement;
  private readonly listEl: HTMLDListElement;

  private props: StatsComponentProps;

  constructor(props: StatsComponentProps) {
    this.props = { ...props };

    this.el = document.createElement('section');
    this.el.className = CSS.root;
    this.el.setAttribute('aria-label', '게임 통계');

    const titleEl = document.createElement('h2');
    titleEl.className = CSS.title;
    titleEl.textContent = '게임 통계';
    this.el.appendChild(titleEl);

    this.listEl = document.createElement('dl');
    this.listEl.className = CSS.list;
    this.el.appendChild(this.listEl);

    this.render();
  }

  getElement(): HTMLElement {
    return this.el;
  }

  update(next: Partial<StatsComponentProps>): void {
    this.props = { ...this.props, ...next };
    this.render();
  }

  destroy(): void {
    this.el.remove();
  }

  private render(): void {
    const { totalGames, wins, losses, highScore } = this.props;
    const winRate = formatWinRate(wins, totalGames);

    this.listEl.innerHTML = '';

    const entries: { label: string; value: string; key: string }[] = [
      { label: '총 게임 수', value: `${totalGames}판`, key: 'total' },
      { label: '승리', value: `${wins}승`, key: 'wins' },
      { label: '패배', value: `${losses}패`, key: 'losses' },
      { label: '승률', value: `${winRate}%`, key: 'winrate' },
      { label: '최고 점수', value: `${highScore}점`, key: 'highscore' },
    ];

    for (const { label, value, key } of entries) {
      const itemEl = document.createElement('div');
      itemEl.className = CSS.item;
      itemEl.dataset.stat = key;

      const dtEl = document.createElement('dt');
      dtEl.className = CSS.label;
      dtEl.textContent = label;
      itemEl.appendChild(dtEl);

      const ddEl = document.createElement('dd');
      ddEl.className = CSS.value;
      ddEl.textContent = value;
      itemEl.appendChild(ddEl);

      this.listEl.appendChild(itemEl);
    }
  }
}
