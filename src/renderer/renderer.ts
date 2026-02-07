import { Card, CardType } from '../game/cards';
import { createDeck, dealCards } from '../game/deck';
import {
  GameState,
  createInitialState,
  updateState,
  switchTurn,
  selectCard,
  flipDeckCard,
  calculateScore,
} from '../game/state';
import { applyMatch } from '../game/matching';
import {
  detectJjok,
  detectPpuk,
  detectBomb,
  detectChongtong,
  canShake,
  applyJjok,
  applyPpuk,
  applyBomb,
  applyChongtong,
  applyShake,
} from '../game/special-rules';
import { selectGo, selectStop, calculateGoMultiplier } from '../game/go-stop';
import { getCombos, getComboScore } from '../game/combos';
import {
  CapturedCards,
  calculateTotal,
  applyBonus,
} from '../game/scoring';

import { selectMove as easySelectMove, selectGoStop as easySelectGoStop } from '../ai/easy';
import { selectMove as mediumSelectMove, selectGoStop as mediumSelectGoStop } from '../ai/medium';
import {
  selectMove as hardSelectMove,
  selectGoStop as hardSelectGoStop,
  calculateExpectedScore,
} from '../ai/hard';

import CardComponent from './components/Card';
import ScoreBoard from './components/ScoreBoard';
import Controls, { type Difficulty } from './components/Controls';
import Stats, { type StatsComponentProps } from './components/Stats';
import { playSound, preloadSounds, stopAllSounds } from './sound';

const AI_TURN_DELAY = 800;
const PHASE_TRANSITION_DELAY = 400;
const DEAL_CARD_DELAY = 60;

function categorizeCaptured(capture: Card[]): CapturedCards {
  return {
    gwang: capture.filter((c) => c.type === CardType.Gwang),
    yeol: capture.filter((c) => c.type === CardType.Yeol),
    tti: capture.filter((c) => c.type === CardType.Tti),
    pi: capture.filter((c) => c.type === CardType.Pi),
  };
}

function getPiCards(capture: Card[]): Card[] {
  return capture.filter((c) => c.type === CardType.Pi);
}

const STATS_KEY = 'gostop-stats';

function loadStats(): StatsComponentProps {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return JSON.parse(raw) as StatsComponentProps;
    }
  } catch {
    /* ignore parse errors */
  }
  return { totalGames: 0, wins: 0, losses: 0, highScore: 0 };
}

function saveStats(stats: StatsComponentProps): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* ignore storage errors */
  }
}

class Game {
  private state: GameState;
  private difficulty: Difficulty = 'medium';
  private stats: StatsComponentProps;
  private knownCards: Card[] = [];
  private pendingTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly appEl: HTMLElement;
  private readonly boardEl: HTMLElement;
  private readonly aiHandRowEl: HTMLElement;
  private readonly fieldEl: HTMLElement;
  private readonly playerHandRowEl: HTMLElement;
  private readonly aiCaptureEl: HTMLElement;
  private readonly playerCaptureEl: HTMLElement;
  private readonly deckPileEl: HTMLElement;
  private readonly messageEl: HTMLElement;

  private playerCardComponents: CardComponent[] = [];
  private aiCardComponents: CardComponent[] = [];
  private fieldCardComponents: CardComponent[] = [];
  private playerCaptureComponents: CardComponent[] = [];
  private aiCaptureComponents: CardComponent[] = [];

  private scoreBoard!: ScoreBoard;
  private controls!: Controls;
  private statsComponent!: Stats;

  constructor(appEl: HTMLElement) {
    this.appEl = appEl;
    this.stats = loadStats();

    const deck = createDeck();
    const deal = dealCards(deck);
    this.state = createInitialState(deal);
    this.state = updateState(this.state, { phase: 'waiting' });

    this.appEl.innerHTML = '';

    this.scoreBoard = new ScoreBoard({ gameState: this.state });
    this.appEl.appendChild(this.scoreBoard.getElement());

    this.boardEl = document.createElement('div');
    this.boardEl.className = 'game-board';
    this.appEl.appendChild(this.boardEl);

    this.aiCaptureEl = document.createElement('div');
    this.aiCaptureEl.className = 'capture-zone';
    this.aiCaptureEl.setAttribute('aria-label', 'AI 획득 패');
    this.boardEl.appendChild(this.aiCaptureEl);

    this.aiHandRowEl = document.createElement('div');
    this.aiHandRowEl.className = 'card-row';
    this.aiHandRowEl.setAttribute('aria-label', 'AI 손패');
    this.boardEl.appendChild(this.aiHandRowEl);

    const fieldWrapper = document.createElement('div');
    fieldWrapper.style.display = 'flex';
    fieldWrapper.style.alignItems = 'center';
    fieldWrapper.style.gap = 'var(--space-md)';
    fieldWrapper.style.justifyContent = 'center';
    this.boardEl.appendChild(fieldWrapper);

    this.fieldEl = document.createElement('div');
    this.fieldEl.className = 'field';
    this.fieldEl.setAttribute('aria-label', '바닥 패');
    fieldWrapper.appendChild(this.fieldEl);

    this.deckPileEl = document.createElement('div');
    this.deckPileEl.className = 'deck-pile';
    this.deckPileEl.setAttribute('aria-label', '덱');
    fieldWrapper.appendChild(this.deckPileEl);

    this.playerHandRowEl = document.createElement('div');
    this.playerHandRowEl.className = 'card-row';
    this.playerHandRowEl.setAttribute('aria-label', '내 손패');
    this.boardEl.appendChild(this.playerHandRowEl);

    this.playerCaptureEl = document.createElement('div');
    this.playerCaptureEl.className = 'capture-zone';
    this.playerCaptureEl.setAttribute('aria-label', '내 획득 패');
    this.boardEl.appendChild(this.playerCaptureEl);

    this.messageEl = document.createElement('div');
    this.messageEl.className = 'overlay';
    this.messageEl.style.display = 'none';
    this.appEl.appendChild(this.messageEl);

    const bottomRow = document.createElement('div');
    bottomRow.style.display = 'flex';
    bottomRow.style.gap = 'var(--space-md)';
    bottomRow.style.alignItems = 'flex-start';
    this.appEl.appendChild(bottomRow);

    this.controls = new Controls({
      gameState: this.state,
      difficulty: this.difficulty,
      onStart: () => this.startGame(),
      onDifficultyChange: (d) => this.setDifficulty(d),
      onGo: () => this.handleGo(),
      onStop: () => this.handleStop(),
    });
    bottomRow.appendChild(this.controls.getElement());

    this.statsComponent = new Stats(this.stats);
    bottomRow.appendChild(this.statsComponent.getElement());

    preloadSounds().catch(() => { /* audio not critical */ });
  }

  private startGame(): void {
    this.clearPendingTimeout();
    stopAllSounds();

    const deck = createDeck();
    const deal = dealCards(deck);
    this.state = createInitialState(deal);
    this.knownCards = [];

    this.handleDealSpecialRules();

    this.state = updateState(this.state, { phase: 'select-hand' });

    this.hideMessage();
    this.renderAll();
    this.animateDeal();
    playSound('card-deal');
  }

  private handleDealSpecialRules(): void {
    const playerChongtong = detectChongtong(this.state.playerHand);
    for (const month of playerChongtong) {
      const result = applyChongtong(
        month,
        this.state.playerHand,
        getPiCards(this.state.aiCapture),
      );
      const stolenFromAi = this.state.aiCapture.filter(
        (c) => !result.stolenPi.some((s) => s.id === c.id),
      );
      this.state = updateState(this.state, {
        playerHand: result.remainingHand,
        playerCapture: [...this.state.playerCapture, ...result.captured, ...result.stolenPi],
        aiCapture: stolenFromAi,
      });
    }

    const playerBombs = detectBomb(this.state.playerHand);
    for (const month of playerBombs) {
      const result = applyBomb(
        month,
        this.state.playerHand,
        this.state.field,
        getPiCards(this.state.aiCapture),
      );
      const stolenFromAi = this.state.aiCapture.filter(
        (c) => !result.stolenPi.some((s) => s.id === c.id),
      );
      this.state = updateState(this.state, {
        playerHand: result.remainingHand,
        field: result.remainingField,
        playerCapture: [...this.state.playerCapture, ...result.captured, ...result.stolenPi],
        aiCapture: stolenFromAi,
      });
    }
  }

  private animateDeal(): void {
    const allCards = [
      ...this.playerCardComponents,
      ...this.aiCardComponents,
      ...this.fieldCardComponents,
    ];
    allCards.forEach((comp, i) => {
      const el = comp.getElement();
      el.dataset.dealing = 'true';
      el.style.animationDelay = `${i * DEAL_CARD_DELAY}ms`;
    });

    const totalDelay = allCards.length * DEAL_CARD_DELAY + 400;
    this.schedulePendingTimeout(() => {
      allCards.forEach((comp) => {
        const el = comp.getElement();
        delete el.dataset.dealing;
        el.style.animationDelay = '';
      });
    }, totalDelay);
  }

  private handlePlayerCardClick(card: Card): void {
    if (this.state.phase !== 'select-hand') return;
    if (this.state.currentTurn !== 'player') return;

    if (canShake(card, this.state.playerHand, this.state.field)) {
      const shakeResult = applyShake(true, this.state.shakingMultiplier);
      this.state = updateState(this.state, {
        shakingMultiplier: shakeResult.multiplier,
      });
    }

    this.state = selectCard(this.state, card);
    this.knownCards.push(card);
    playSound('card-place');

    this.matchHandCard(card, 'player');
  }

  private matchHandCard(card: Card, turn: 'player' | 'ai'): void {
    const captureKey = turn === 'player' ? 'playerCapture' : 'aiCapture';
    const opponentCaptureKey = turn === 'player' ? 'aiCapture' : 'playerCapture';

    if (detectJjok(card, this.state.field)) {
      const result = applyJjok(
        card,
        this.state.field,
        getPiCards(this.state[opponentCaptureKey]),
      );
      const opponentWithoutStolen = this.state[opponentCaptureKey].filter(
        (c) => !result.stolenPi.some((s) => s.id === c.id),
      );
      this.state = updateState(this.state, {
        field: result.remainingField,
        [captureKey]: [...this.state[captureKey], ...result.captured, ...result.stolenPi],
        [opponentCaptureKey]: opponentWithoutStolen,
      });
      playSound('card-match');
      this.proceedToFlipDeck();
      return;
    }

    if (detectPpuk(card, this.state.field)) {
      const result = applyPpuk(card, this.state.field);
      this.state = updateState(this.state, {
        field: result.remainingField,
        [captureKey]: [...this.state[captureKey], ...result.captured],
      });
      playSound('card-match');
      this.proceedToFlipDeck();
      return;
    }

    const matchResult = applyMatch(card, this.state.field);

    if (matchResult.requiresChoice && matchResult.matchingCards) {
      const bestMatch = this.pickBestMatch(matchResult.matchingCards);
      this.state = updateState(this.state, {
        field: this.state.field.filter((f) => f.id !== bestMatch.id),
        [captureKey]: [...this.state[captureKey], card, bestMatch],
      });
      playSound('card-match');
    } else if (matchResult.captured.length > 0) {
      this.state = updateState(this.state, {
        field: matchResult.remainingField,
        [captureKey]: [...this.state[captureKey], ...matchResult.captured],
      });
      playSound('card-match');
    } else {
      this.state = updateState(this.state, {
        field: matchResult.remainingField,
      });
    }

    this.proceedToFlipDeck();
  }

  private proceedToFlipDeck(): void {
    this.state = updateState(this.state, { phase: 'flip-deck' });
    this.renderAll();

    this.schedulePendingTimeout(() => {
      this.flipAndMatchDeckCard();
    }, PHASE_TRANSITION_DELAY);
  }

  private flipAndMatchDeckCard(): void {
    if (this.state.deck.length === 0) {
      this.checkScoreAfterTurn();
      return;
    }

    this.state = flipDeckCard(this.state);
    const flipped = this.state.flippedCard;
    if (!flipped) {
      this.checkScoreAfterTurn();
      return;
    }

    this.knownCards.push(flipped);

    const turn = this.state.currentTurn;
    const captureKey = turn === 'player' ? 'playerCapture' : 'aiCapture';
    const opponentCaptureKey = turn === 'player' ? 'aiCapture' : 'playerCapture';

    if (detectJjok(flipped, this.state.field)) {
      const result = applyJjok(
        flipped,
        this.state.field,
        getPiCards(this.state[opponentCaptureKey]),
      );
      const opponentWithoutStolen = this.state[opponentCaptureKey].filter(
        (c) => !result.stolenPi.some((s) => s.id === c.id),
      );
      this.state = updateState(this.state, {
        field: result.remainingField,
        [captureKey]: [...this.state[captureKey], ...result.captured, ...result.stolenPi],
        [opponentCaptureKey]: opponentWithoutStolen,
        phase: 'match-deck',
      });
      playSound('card-match');
      this.checkScoreAfterTurn();
      return;
    }

    if (detectPpuk(flipped, this.state.field)) {
      const result = applyPpuk(flipped, this.state.field);
      this.state = updateState(this.state, {
        field: result.remainingField,
        [captureKey]: [...this.state[captureKey], ...result.captured],
        phase: 'match-deck',
      });
      playSound('card-match');
      this.checkScoreAfterTurn();
      return;
    }

    const matchResult = applyMatch(flipped, this.state.field);

    if (matchResult.requiresChoice && matchResult.matchingCards) {
      const bestMatch = this.pickBestMatch(matchResult.matchingCards);
      this.state = updateState(this.state, {
        field: this.state.field.filter((f) => f.id !== bestMatch.id),
        [captureKey]: [...this.state[captureKey], flipped, bestMatch],
        phase: 'match-deck',
      });
      playSound('card-match');
    } else if (matchResult.captured.length > 0) {
      this.state = updateState(this.state, {
        field: matchResult.remainingField,
        [captureKey]: [...this.state[captureKey], ...matchResult.captured],
        phase: 'match-deck',
      });
      playSound('card-match');
    } else {
      this.state = updateState(this.state, {
        field: matchResult.remainingField,
        phase: 'match-deck',
      });
    }

    this.checkScoreAfterTurn();
  }

  private checkScoreAfterTurn(): void {
    this.state = updateState(this.state, { phase: 'check-score' });

    const currentCapture = this.state.currentTurn === 'player'
      ? this.state.playerCapture
      : this.state.aiCapture;
    const combos = getCombos(currentCapture);
    if (combos.length > 0) {
      playSound('combo');
    }

    if (this.state.playerHand.length === 0 && this.state.aiHand.length === 0) {
      this.endGame();
      return;
    }

    const score = calculateScore(currentCapture);
    if (score >= 7) {
      this.state = updateState(this.state, { phase: 'go-stop' });
      this.renderAll();

      if (this.state.currentTurn === 'ai') {
        this.schedulePendingTimeout(() => {
          this.aiGoStopDecision();
        }, AI_TURN_DELAY);
      }
      return;
    }

    this.state = switchTurn(this.state);
    this.renderAll();

    if (this.state.currentTurn === 'ai') {
      this.schedulePendingTimeout(() => {
        this.executeAiTurn();
      }, AI_TURN_DELAY);
    }
  }

  private handleGo(): void {
    if (this.state.phase !== 'go-stop') return;
    if (this.state.currentTurn !== 'player') return;

    this.state = selectGo(this.state);
    playSound('go');
    this.renderAll();

    if (this.state.currentTurn === 'ai') {
      this.schedulePendingTimeout(() => {
        this.executeAiTurn();
      }, AI_TURN_DELAY);
    }
  }

  private handleStop(): void {
    if (this.state.phase !== 'go-stop') return;
    if (this.state.currentTurn !== 'player') return;

    this.state = selectStop(this.state);
    playSound('stop');
    this.endGame();
  }

  private executeAiTurn(): void {
    if (this.state.phase !== 'select-hand') return;
    if (this.state.currentTurn !== 'ai') return;
    if (this.state.aiHand.length === 0) {
      this.checkScoreAfterTurn();
      return;
    }

    const aiCard = this.getAiMove();
    this.knownCards.push(aiCard);

    const newAiHand = this.state.aiHand.filter((c) => c.id !== aiCard.id);
    this.state = updateState(this.state, {
      aiHand: newAiHand,
      selectedCard: aiCard,
    });
    playSound('card-place');

    this.matchHandCard(aiCard, 'ai');
  }

  private getAiMove(): Card {
    switch (this.difficulty) {
      case 'easy':
        return easySelectMove(this.state, this.state.aiHand, this.state.field);
      case 'medium':
        return mediumSelectMove(this.state, this.state.aiHand, this.state.field);
      case 'hard':
        return hardSelectMove(this.state, this.state.aiHand, this.state.field, this.knownCards);
    }
  }

  private aiGoStopDecision(): void {
    const aiCapture = this.state.aiCapture;
    const aiScore = calculateScore(aiCapture);
    const playerScore = calculateScore(this.state.playerCapture);

    let decision: 'go' | 'stop';

    switch (this.difficulty) {
      case 'easy':
        decision = easySelectGoStop(aiScore);
        break;
      case 'medium':
        decision = mediumSelectGoStop(aiScore, aiScore, playerScore);
        break;
      case 'hard': {
        const fallbackCard = this.state.aiHand[0] ?? this.state.field[0];
        const expected = fallbackCard
          ? calculateExpectedScore(
              this.state,
              fallbackCard,
              this.state.aiHand,
              this.state.field,
              this.knownCards,
            )
          : aiScore;
        decision = hardSelectGoStop(aiScore, aiScore, playerScore, expected);
        break;
      }
    }

    if (decision === 'go') {
      this.state = selectGo(this.state);
      playSound('go');
      this.renderAll();

      if (this.state.currentTurn === 'ai') {
        this.schedulePendingTimeout(() => {
          this.executeAiTurn();
        }, AI_TURN_DELAY);
      }

    } else {
      this.state = selectStop(this.state);
      playSound('stop');
      this.endGame();
    }
  }

  private endGame(): void {
    this.state = updateState(this.state, { phase: 'end' });

    const playerCategorized = categorizeCaptured(this.state.playerCapture);
    const aiCategorized = categorizeCaptured(this.state.aiCapture);
    const playerScoreObj = calculateTotal(playerCategorized);
    const aiScoreObj = calculateTotal(aiCategorized);

    const playerCombos = getCombos(this.state.playerCapture);
    const aiCombos = getCombos(this.state.aiCapture);
    const playerComboScore = getComboScore(playerCombos);
    const aiComboScore = getComboScore(aiCombos);

    const playerGoMult = calculateGoMultiplier(this.state.goCount.player);
    const aiGoMult = calculateGoMultiplier(this.state.goCount.ai);

    const shakeMult = this.state.shakingMultiplier;

    const playerBonus = applyBonus(playerScoreObj, aiScoreObj, playerCategorized, aiCategorized);
    const aiBonus = applyBonus(aiScoreObj, playerScoreObj, aiCategorized, playerCategorized);

    const playerFinal = playerBonus.finalScore * playerGoMult * shakeMult + playerComboScore;
    const aiFinal = aiBonus.finalScore * aiGoMult + aiComboScore;

    const playerWon = playerFinal >= aiFinal;

    this.stats = {
      totalGames: this.stats.totalGames + 1,
      wins: this.stats.wins + (playerWon ? 1 : 0),
      losses: this.stats.losses + (playerWon ? 0 : 1),
      highScore: Math.max(this.stats.highScore, playerFinal),
    };
    saveStats(this.stats);
    this.statsComponent.update(this.stats);

    playSound(playerWon ? 'win' : 'lose');
    this.renderAll();

    const bonusText = playerBonus.bonuses.length > 0
      ? `\n보너스: ${playerBonus.bonuses.join(', ')}`
      : '';
    const resultTitle = playerWon ? '승리!' : '패배';
    const resultMessage =
      `내 점수: ${playerFinal}점 | AI 점수: ${aiFinal}점${bonusText}`;

    this.showMessage(resultTitle, resultMessage);
  }

  private renderAll(): void {
    this.scoreBoard.update({ gameState: this.state });
    this.controls.update({
      gameState: this.state,
      difficulty: this.difficulty,
      onStart: () => this.startGame(),
      onDifficultyChange: (d) => this.setDifficulty(d),
      onGo: () => this.handleGo(),
      onStop: () => this.handleStop(),
    });

    this.renderPlayerHand();
    this.renderAiHand();
    this.renderField();
    this.renderPlayerCapture();
    this.renderAiCapture();
    this.renderDeck();
  }

  private renderPlayerHand(): void {
    this.destroyComponents(this.playerCardComponents);
    this.playerCardComponents = [];
    this.playerHandRowEl.innerHTML = '';

    const isSelectPhase =
      this.state.phase === 'select-hand' && this.state.currentTurn === 'player';

    for (const card of this.state.playerHand) {
      const comp = new CardComponent({
        card,
        isSelectable: isSelectPhase,
        onClick: (c) => this.handlePlayerCardClick(c),
      });
      this.playerCardComponents.push(comp);
      this.playerHandRowEl.appendChild(comp.getElement());
    }
  }

  private renderAiHand(): void {
    this.destroyComponents(this.aiCardComponents);
    this.aiCardComponents = [];
    this.aiHandRowEl.innerHTML = '';

    for (const card of this.state.aiHand) {
      const comp = new CardComponent({
        card,
        isSelectable: false,
      });
      const el = comp.getElement();
      el.style.background = 'var(--dancheong-red)';
      const img = el.querySelector('img');
      if (img) img.style.visibility = 'hidden';
      this.aiCardComponents.push(comp);
      this.aiHandRowEl.appendChild(el);
    }
  }

  private renderField(): void {
    this.destroyComponents(this.fieldCardComponents);
    this.fieldCardComponents = [];
    this.fieldEl.innerHTML = '';

    for (const card of this.state.field) {
      const comp = new CardComponent({
        card,
        isSelectable: false,
      });
      this.fieldCardComponents.push(comp);
      this.fieldEl.appendChild(comp.getElement());
    }
  }

  private renderPlayerCapture(): void {
    this.destroyComponents(this.playerCaptureComponents);
    this.playerCaptureComponents = [];
    this.playerCaptureEl.innerHTML = '';

    for (const card of this.state.playerCapture) {
      const comp = new CardComponent({
        card,
        isSelectable: false,
      });
      this.playerCaptureComponents.push(comp);
      this.playerCaptureEl.appendChild(comp.getElement());
    }
  }

  private renderAiCapture(): void {
    this.destroyComponents(this.aiCaptureComponents);
    this.aiCaptureComponents = [];
    this.aiCaptureEl.innerHTML = '';

    for (const card of this.state.aiCapture) {
      const comp = new CardComponent({
        card,
        isSelectable: false,
      });
      this.aiCaptureComponents.push(comp);
      this.aiCaptureEl.appendChild(comp.getElement());
    }
  }

  private renderDeck(): void {
    this.deckPileEl.style.visibility =
      this.state.deck.length > 0 ? 'visible' : 'hidden';
  }

  private showMessage(title: string, message: string): void {
    this.messageEl.innerHTML = '';
    this.messageEl.style.display = 'flex';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const titleEl = document.createElement('h2');
    titleEl.className = 'modal__title';
    titleEl.textContent = title;
    modal.appendChild(titleEl);

    const msgEl = document.createElement('p');
    msgEl.className = 'modal__message';
    msgEl.textContent = message;
    modal.appendChild(msgEl);

    const btn = document.createElement('button');
    btn.className = 'controls__start-btn';
    btn.textContent = '새 게임';
    btn.addEventListener('click', () => {
      this.startGame();
    });
    modal.appendChild(btn);

    this.messageEl.appendChild(modal);
  }

  private hideMessage(): void {
    this.messageEl.style.display = 'none';
    this.messageEl.innerHTML = '';
  }

  private setDifficulty(d: Difficulty): void {
    this.difficulty = d;
  }

  private pickBestMatch(cards: Card[]): Card {
    const typeValues: Record<CardType, number> = {
      [CardType.Gwang]: 20,
      [CardType.Yeol]: 10,
      [CardType.Tti]: 5,
      [CardType.Pi]: 1,
    };
    return cards.reduce((best, current) =>
      typeValues[current.type] > typeValues[best.type] ? current : best,
    );
  }

  private destroyComponents(components: CardComponent[]): void {
    for (const comp of components) {
      comp.destroy();
    }
  }

  private schedulePendingTimeout(fn: () => void, delay: number): void {
    this.clearPendingTimeout();
    this.pendingTimeout = setTimeout(fn, delay);
  }

  private clearPendingTimeout(): void {
    if (this.pendingTimeout !== null) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
  }

  destroy(): void {
    this.clearPendingTimeout();
    stopAllSounds();

    this.destroyComponents(this.playerCardComponents);
    this.destroyComponents(this.aiCardComponents);
    this.destroyComponents(this.fieldCardComponents);
    this.destroyComponents(this.playerCaptureComponents);
    this.destroyComponents(this.aiCaptureComponents);

    this.scoreBoard.destroy();
    this.controls.destroy();
    this.statsComponent.destroy();
  }
}

const appElement = document.getElementById('app');

if (appElement) {
  new Game(appElement);
}
