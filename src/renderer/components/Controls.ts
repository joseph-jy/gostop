import { GameState, calculateScore } from '../../game/state';
import { canGoOrStop } from '../../game/go-stop';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ControlsComponentProps {
  gameState: GameState;
  difficulty: Difficulty;
  onStart: () => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onGo: () => void;
  onStop: () => void;
}

const CSS = {
  root: 'controls',
  startBtn: 'controls__start-btn',
  difficultyGroup: 'controls__difficulty-group',
  difficultyLabel: 'controls__difficulty-label',
  difficultySelect: 'controls__difficulty-select',
  goStopGroup: 'controls__go-stop-group',
  goBtn: 'controls__go-btn',
  stopBtn: 'controls__stop-btn',
} as const;

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: '쉬움' },
  { value: 'medium', label: '보통' },
  { value: 'hard', label: '어려움' },
];

export default class Controls {
  private readonly el: HTMLElement;
  private readonly startBtnEl: HTMLButtonElement;
  private readonly selectEl: HTMLSelectElement;
  private readonly goStopGroupEl: HTMLElement;
  private readonly goBtnEl: HTMLButtonElement;
  private readonly stopBtnEl: HTMLButtonElement;

  private props: ControlsComponentProps;

  private boundHandleStart: () => void;
  private boundHandleDifficultyChange: () => void;
  private boundHandleGo: () => void;
  private boundHandleStop: () => void;

  constructor(props: ControlsComponentProps) {
    this.props = { ...props };

    this.el = document.createElement('section');
    this.el.className = CSS.root;
    this.el.setAttribute('aria-label', '게임 컨트롤');

    this.startBtnEl = document.createElement('button');
    this.startBtnEl.className = CSS.startBtn;
    this.startBtnEl.type = 'button';
    this.el.appendChild(this.startBtnEl);

    const diffGroup = document.createElement('div');
    diffGroup.className = CSS.difficultyGroup;
    this.el.appendChild(diffGroup);

    const diffLabel = document.createElement('label');
    diffLabel.className = CSS.difficultyLabel;
    diffLabel.textContent = '난이도';
    diffGroup.appendChild(diffLabel);

    this.selectEl = document.createElement('select');
    this.selectEl.className = CSS.difficultySelect;
    this.selectEl.setAttribute('aria-label', '난이도 선택');
    diffLabel.setAttribute('for', 'controls-difficulty');
    this.selectEl.id = 'controls-difficulty';

    for (const opt of DIFFICULTY_OPTIONS) {
      const optionEl = document.createElement('option');
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      this.selectEl.appendChild(optionEl);
    }

    diffGroup.appendChild(this.selectEl);

    this.goStopGroupEl = document.createElement('div');
    this.goStopGroupEl.className = CSS.goStopGroup;
    this.goStopGroupEl.setAttribute('role', 'group');
    this.goStopGroupEl.setAttribute('aria-label', '고/스톱 선택');
    this.el.appendChild(this.goStopGroupEl);

    this.goBtnEl = document.createElement('button');
    this.goBtnEl.className = CSS.goBtn;
    this.goBtnEl.type = 'button';
    this.goBtnEl.textContent = '고';
    this.goStopGroupEl.appendChild(this.goBtnEl);

    this.stopBtnEl = document.createElement('button');
    this.stopBtnEl.className = CSS.stopBtn;
    this.stopBtnEl.type = 'button';
    this.stopBtnEl.textContent = '스톱';
    this.goStopGroupEl.appendChild(this.stopBtnEl);

    this.boundHandleStart = this.handleStart.bind(this);
    this.boundHandleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.boundHandleGo = this.handleGo.bind(this);
    this.boundHandleStop = this.handleStop.bind(this);

    this.startBtnEl.addEventListener('click', this.boundHandleStart);
    this.selectEl.addEventListener('change', this.boundHandleDifficultyChange);
    this.goBtnEl.addEventListener('click', this.boundHandleGo);
    this.stopBtnEl.addEventListener('click', this.boundHandleStop);

    this.render();
  }

  getElement(): HTMLElement {
    return this.el;
  }

  update(next: Partial<ControlsComponentProps>): void {
    this.props = { ...this.props, ...next };
    this.render();
  }

  destroy(): void {
    this.startBtnEl.removeEventListener('click', this.boundHandleStart);
    this.selectEl.removeEventListener('change', this.boundHandleDifficultyChange);
    this.goBtnEl.removeEventListener('click', this.boundHandleGo);
    this.stopBtnEl.removeEventListener('click', this.boundHandleStop);
    this.el.remove();
  }

  private render(): void {
    const { gameState, difficulty } = this.props;
    const isPlaying = gameState.phase !== 'waiting' && gameState.phase !== 'end';

    this.startBtnEl.textContent = isPlaying ? '다시 시작' : '게임 시작';
    this.startBtnEl.setAttribute(
      'aria-label',
      isPlaying ? '게임 다시 시작' : '새 게임 시작',
    );

    this.selectEl.value = difficulty;
    this.selectEl.disabled = isPlaying;

    const isGoStopPhase = gameState.phase === 'go-stop';
    const playerScore = calculateScore(gameState.playerCapture);
    const showGoStop = isGoStopPhase
      && canGoOrStop(playerScore)
      && gameState.currentTurn === 'player';

    this.goStopGroupEl.hidden = !showGoStop;
    this.goBtnEl.disabled = !showGoStop;
    this.stopBtnEl.disabled = !showGoStop;
  }

  private handleStart(): void {
    this.props.onStart();
  }

  private handleDifficultyChange(): void {
    const value = this.selectEl.value as Difficulty;
    this.props.onDifficultyChange(value);
  }

  private handleGo(): void {
    if (!this.goBtnEl.disabled) {
      this.props.onGo();
    }
  }

  private handleStop(): void {
    if (!this.stopBtnEl.disabled) {
      this.props.onStop();
    }
  }
}
