import { CardType } from '../../game/cards';
import { GameState, calculateScore, type Turn, type Phase } from '../../game/state';
import { getCombos, type ComboName } from '../../game/combos';

export interface ScoreBoardComponentProps {
  gameState: GameState;
}

interface CardCounts {
  gwang: number;
  yeol: number;
  tti: number;
  pi: number;
}

const CSS = {
  root: 'scoreboard',
  panel: 'scoreboard__panel',
  panelPlayer: 'scoreboard__panel--player',
  panelAi: 'scoreboard__panel--ai',
  panelActive: 'scoreboard__panel--active',
  name: 'scoreboard__name',
  score: 'scoreboard__score',
  scoreValue: 'scoreboard__score-value',
  breakdown: 'scoreboard__breakdown',
  breakdownItem: 'scoreboard__breakdown-item',
  breakdownLabel: 'scoreboard__breakdown-label',
  breakdownCount: 'scoreboard__breakdown-count',
  combos: 'scoreboard__combos',
  comboTag: 'scoreboard__combo-tag',
  goCount: 'scoreboard__go-count',
  turnIndicator: 'scoreboard__turn-indicator',
  phaseIndicator: 'scoreboard__phase-indicator',
  divider: 'scoreboard__divider',
} as const;

const COMBO_LABELS: Record<ComboName, string> = {
  godori: '고도리',
  hongdan: '홍단',
  cheongdan: '청단',
  chodan: '초단',
};

const PHASE_LABELS: Record<Phase, string> = {
  waiting: '대기 중',
  'select-hand': '패 선택',
  'match-hand': '패 매칭',
  'choose-match-hand': '카드 선택',
  'flip-deck': '뒤집기',
  'match-deck': '덱 매칭',
  'choose-match-deck': '카드 선택',
  'check-score': '점수 확인',
  'go-stop': '고/스톱',
  end: '게임 종료',
};

const TURN_LABELS: Record<Turn, string> = {
  player: '플레이어',
  ai: 'AI',
};

function countCardTypes(capture: GameState['playerCapture']): CardCounts {
  return {
    gwang: capture.filter(c => c.type === CardType.Gwang).length,
    yeol: capture.filter(c => c.type === CardType.Yeol).length,
    tti: capture.filter(c => c.type === CardType.Tti).length,
    pi: capture.filter(c => c.type === CardType.Pi).length,
  };
}

export default class ScoreBoard {
  private readonly el: HTMLElement;
  private readonly playerPanelEl: HTMLElement;
  private readonly aiPanelEl: HTMLElement;
  private readonly turnIndicatorEl: HTMLElement;
  private readonly phaseIndicatorEl: HTMLElement;

  private props: ScoreBoardComponentProps;

  constructor(props: ScoreBoardComponentProps) {
    this.props = { ...props };

    this.el = document.createElement('section');
    this.el.className = CSS.root;
    this.el.setAttribute('aria-label', '점수판');

    this.playerPanelEl = this.createPanel('player');
    this.el.appendChild(this.playerPanelEl);

    const divider = document.createElement('div');
    divider.className = CSS.divider;
    this.el.appendChild(divider);

    this.turnIndicatorEl = document.createElement('div');
    this.turnIndicatorEl.className = CSS.turnIndicator;
    this.turnIndicatorEl.setAttribute('aria-live', 'polite');
    divider.appendChild(this.turnIndicatorEl);

    this.phaseIndicatorEl = document.createElement('div');
    this.phaseIndicatorEl.className = CSS.phaseIndicator;
    this.phaseIndicatorEl.setAttribute('aria-live', 'polite');
    divider.appendChild(this.phaseIndicatorEl);

    this.aiPanelEl = this.createPanel('ai');
    this.el.appendChild(this.aiPanelEl);

    this.render();
  }

  getElement(): HTMLElement {
    return this.el;
  }

  update(next: Partial<ScoreBoardComponentProps>): void {
    this.props = { ...this.props, ...next };
    this.render();
  }

  destroy(): void {
    this.el.remove();
  }

  private createPanel(side: 'player' | 'ai'): HTMLElement {
    const panel = document.createElement('article');
    panel.className = `${CSS.panel} ${side === 'player' ? CSS.panelPlayer : CSS.panelAi}`;
    panel.dataset.side = side;

    const nameEl = document.createElement('h3');
    nameEl.className = CSS.name;
    nameEl.textContent = side === 'player' ? '플레이어' : 'AI';
    panel.appendChild(nameEl);

    const scoreEl = document.createElement('div');
    scoreEl.className = CSS.score;
    panel.appendChild(scoreEl);

    const scoreValueEl = document.createElement('span');
    scoreValueEl.className = CSS.scoreValue;
    scoreEl.appendChild(scoreValueEl);

    const goCountEl = document.createElement('span');
    goCountEl.className = CSS.goCount;
    scoreEl.appendChild(goCountEl);

    const breakdownEl = document.createElement('dl');
    breakdownEl.className = CSS.breakdown;
    panel.appendChild(breakdownEl);

    const combosEl = document.createElement('div');
    combosEl.className = CSS.combos;
    combosEl.setAttribute('aria-label', '콤보 패턴');
    panel.appendChild(combosEl);

    return panel;
  }

  private render(): void {
    const { gameState } = this.props;

    this.renderPanel(
      this.playerPanelEl,
      gameState.playerCapture,
      gameState.goCount.player,
      gameState.currentTurn === 'player',
    );

    this.renderPanel(
      this.aiPanelEl,
      gameState.aiCapture,
      gameState.goCount.ai,
      gameState.currentTurn === 'ai',
    );

    this.turnIndicatorEl.textContent = `${TURN_LABELS[gameState.currentTurn]}의 턴`;
    this.phaseIndicatorEl.textContent = PHASE_LABELS[gameState.phase];

    this.playerPanelEl.classList.toggle(CSS.panelActive, gameState.currentTurn === 'player');
    this.aiPanelEl.classList.toggle(CSS.panelActive, gameState.currentTurn === 'ai');
  }

  private renderPanel(
    panelEl: HTMLElement,
    capture: GameState['playerCapture'],
    goCount: number,
    _isActive: boolean,
  ): void {
    const score = calculateScore(capture);
    const counts = countCardTypes(capture);
    const combos = getCombos(capture);

    const scoreValueEl = panelEl.querySelector<HTMLSpanElement>(`.${CSS.scoreValue}`);
    if (scoreValueEl) {
      scoreValueEl.textContent = String(score);
      scoreValueEl.setAttribute('aria-label', `점수 ${score}점`);
    }

    const goCountEl = panelEl.querySelector<HTMLSpanElement>(`.${CSS.goCount}`);
    if (goCountEl) {
      if (goCount > 0) {
        goCountEl.textContent = `${goCount}고`;
        goCountEl.hidden = false;
      } else {
        goCountEl.textContent = '';
        goCountEl.hidden = true;
      }
    }

    this.renderBreakdown(panelEl, counts);
    this.renderCombos(panelEl, combos);
  }

  private renderBreakdown(panelEl: HTMLElement, counts: CardCounts): void {
    const breakdownEl = panelEl.querySelector<HTMLDListElement>(`.${CSS.breakdown}`);
    if (!breakdownEl) return;

    breakdownEl.innerHTML = '';

    const categories: { label: string; count: number; key: string }[] = [
      { label: '광', count: counts.gwang, key: 'gwang' },
      { label: '열', count: counts.yeol, key: 'yeol' },
      { label: '띠', count: counts.tti, key: 'tti' },
      { label: '피', count: counts.pi, key: 'pi' },
    ];

    for (const { label, count, key } of categories) {
      const itemEl = document.createElement('div');
      itemEl.className = CSS.breakdownItem;
      itemEl.dataset.category = key;

      const dtEl = document.createElement('dt');
      dtEl.className = CSS.breakdownLabel;
      dtEl.textContent = label;
      itemEl.appendChild(dtEl);

      const ddEl = document.createElement('dd');
      ddEl.className = CSS.breakdownCount;
      ddEl.textContent = String(count);
      itemEl.appendChild(ddEl);

      breakdownEl.appendChild(itemEl);
    }
  }

  private renderCombos(panelEl: HTMLElement, combos: ComboName[]): void {
    const combosEl = panelEl.querySelector<HTMLElement>(`.${CSS.combos}`);
    if (!combosEl) return;

    combosEl.innerHTML = '';

    for (const combo of combos) {
      const tagEl = document.createElement('span');
      tagEl.className = CSS.comboTag;
      tagEl.dataset.combo = combo;
      tagEl.textContent = COMBO_LABELS[combo];
      combosEl.appendChild(tagEl);
    }
  }
}
