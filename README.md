# 고스톱 (Go-Stop)

한국 전통 화투 카드 게임인 고스톱을 플레이할 수 있는 Windows 데스크톱 애플리케이션입니다.

## 프로젝트 개요

고스톱은 Electron + TypeScript로 개발된 2인용 화투 게임으로, 3단계 난이도의 AI 상대와 플레이할 수 있습니다.

### 기술 스택

- **런타임**: Electron 40.1.0
- **언어**: TypeScript 5.9.3 (strict mode)
- **빌드 도구**: Webpack 5.105.0
- **테스트**: Vitest 4.0.18 (단위 테스트) + Playwright 1.58.1 (E2E 테스트)
- **패키징**: electron-builder 26.7.0

## 빌드 및 실행 방법

### 전제조건

- Node.js 18+ 설치 필요
- Windows 환경 (주 타겟)

### 의존성 설치

```bash
npm install
```

### 개발 모드

```bash
# TypeScript 컴파일 + Electron 실행 (DevTools 자동 열림)
npm start
```

### 빌드

```bash
# Webpack 빌드만 실행
npm run build
```

### 테스트

```bash
# 단위 테스트 실행 (240 테스트)
npm test

# 테스트 왓치 모드
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

### 패키징

```bash
# 모든 플랫폼용 인스톨러 생성
npm run dist

# Windows NSIS 인스톨러 (.exe) 생성
npm run dist:win
```

## 프로젝트 구조

```
gostop/
├── src/
│   ├── main/              # Electron 메인 프로세스
│   │   └── main.ts        # 앱 라이프사이클, 윈도우 생성
│   ├── preload/           # 보안 브리지
│   │   └── preload.ts
│   ├── renderer/          # UI 레이어
│   │   ├── renderer.ts    # 렌더러 엔트리 포인트
│   │   └── index.html     # HTML 템플릿
│   ├── game/              # 순수 게임 로직 (8개 모듈)
│   │   ├── cards.ts       # 카드 정의 및 상수
│   │   ├── deck.ts        # 덱 생성 및 셔플
│   │   ├── state.ts       # 게임 상태 관리
│   │   ├── matching.ts    # 카드 매칭 규칙
│   │   ├── special-rules.ts # 특수 규칙 (쪽, 뻑, 폭탄, 청통, 흔들기)
│   │   ├── scoring.ts     # 점수 계산
│   │   ├── combos.ts      # 콤보/패 탐지 (고도리, 단 패턴)
│   │   └── go-stop.ts     # 메인 게임 플로우
│   ├── ai/                # AI 상대 (3난이도)
│   │   ├── easy.ts        # 랜덤 선택
│   │   ├── medium.ts      # 전략적 선택 + 휴리스틱
│   │   └── hard.ts        # 고급 전략 + 룩어헤드
│   ├── store/             # 통계 저장 (진행 중)
│   ├── assets/            # 게임 자산
│   │   ├── cards/         # 48장 카드 이미지
│   │   └── sounds/        # 8개 효과음
│   └── __tests__/         # 단위 테스트 (13 파일, 240 테스트)
├── e2e/                   # E2E 테스트 (4 파일)
├── dist/                  # 빌드 출력
├── coverage/              # 테스트 커버리지 리포트
├── webpack.config.js      # 3개 엔트리 포인트 빌드 설정
├── tsconfig.json          # TypeScript 설정
├── vitest.config.ts       # 단위 테스트 설정
├── playwright.config.ts   # E2E 테스트 설정
└── electron-builder.yml   # Windows 인스톨러 설정
```

## 기여 방법

### 현재 상태

- ✅ **완료**: 게임 로직 (240 테스트 통과)
- ✅ **완료**: AI 시스템 (쉬움, 보통, 어려움 3단계)
- ✅ **완료**: 카드/사운드 자산
- 🚧 **진행 중**: UI 컴포넌트 (Wave 5)
- ⏳ **대기 중**: 통합 테스트 및 패키징 (Wave 6)

### 기여할 수 있는 영역

#### 1. UI 컴포넌트 개발 (우선순위 높음)

`src/renderer/components/` 디렉토리에 다음 컴포넌트가 필요합니다:

- **Card.ts**: 카드 이미지 렌더링, 클릭 핸들링, 호버 효과
- **ScoreBoard.ts**: 점수판, 콤보 표시, 턴 표시
- **Controls.ts**: 시작 버튼, 난이도 선택, Go/Stop 버튼
- **Stats.ts**: 게임 통계 표시

**구현 가이드**:
```bash
# 새 컴포넌트 생성
touch src/renderer/components/Card.ts

# 스타일 파일 생성
touch src/renderer/styles.css

# renderer.ts에서 컴포넌트 임포트 및 마운트
```

#### 2. 사운드 통합

`src/renderer/sound.ts` 모듈에서 게임 이벤트와 효과음을 매핑하세요:

```typescript
// 예: src/renderer/sound.ts
export const playSound = (event: GameEvent) => {
  const audio = new Audio(`/assets/sounds/${event}.mp3`);
  audio.play();
};
```

#### 3. 통계 저장 시스템

`src/store/stats.ts` 모듈에서 게임 통계를 구현하세요:

```typescript
// 예: src/store/stats.ts
export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  highScore: number;
}

export const saveStats = (stats: GameStats) => { /* ... */ };
export const loadStats = (): GameStats => { /* ... */ };
```

#### 4. E2E 테스트 작성

`e2e/` 디렉토리에서 Playwright 테스트를 작성하세요:

```bash
# 새 E2E 테스트 생성
touch e2e/game-flow.test.ts
```

```typescript
// 예: e2e/game-flow.test.ts
import { test, expect } from '@playwright/test';

test('complete game flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // 테스트 시나리오 작성
});
```

### 개발 워크플로우

1. **이슈 확인**: 프로젝트 이슈 또는 HANDOFF.md에서 할 일 확인
2. **브랜치 생성**: `git checkout -b feature/your-feature`
3. **코드 작성**: TypeScript 규칙 준수 (strict mode)
4. **테스트 추가**: 변경 사항에 대한 테스트 작성
5. **테스트 통과**: `npm test` 및 `npm run build`
6. **커밋**: 명확한 커밋 메시지 작성
7. **PR 생성**: 변경 사항 설명과 함께 PR 생성

### 코드 스타일

- TypeScript strict mode 준수
- 변수/함수명은 camelCase 사용
- 상수는 UPPER_SNAKE_CASE 사용
- 의미 있는 주석 작성 (특히 복잡한 로직)
- 빈 catch 블록 금지

### 테스트 가이드라인

- 새 기능은 항상 테스트와 함께 제출
- 테스트는 GIVEN-WHEN-THEN 패턴으로 작성
- 엣지 케이스도 테스트 커버리지 포함
- E2E 테스트는 UI 자동화가 아닌 게임 플로우 테스트에 집중

## 라이선스

ISC

## 연락처

이슈 트래커를 통해 버그 리포트나 기능 요청을 제출해주세요.
