# 아버지를 위한 데스크탑 고스톱 게임

## TL;DR

> **Quick Summary**: 아버지께 드릴 Windows용 2인 고스톱(맞고) 게임. 전통적인 화투 느낌의 UI, AI 3단계 난이도, 사운드 효과, 전적 기록 포함.
> 
> **Deliverables**:
> - Windows 설치 파일 (.exe)
> - 완전한 2인 맞고 게임 로직
> - AI 대전 (초급/중급/고급)
> - 통계/전적 기록
> - 사운드 효과
> 
> **Estimated Effort**: Large (게임 로직 복잡, UI 작업 많음)
> **Parallel Execution**: YES - 6 waves
> **Critical Path**: 프로젝트 설정 → 게임 로직 → AI → UI → 빌드

---

## Context

### Original Request
아버지가 고스톱 게임을 좋아하시지만 사람과 하는 것은 싫어하심. 컴퓨터와 즐길 수 있는 데스크탑용 고스톱 게임을 만들어 드리고 싶음.

### Interview Summary
**Key Discussions**:
- 게임 방식: 2인 고스톱 (맞고) - 1:1 AI 대전
- 기술 스택: Electron + TypeScript (안정적, Windows 배포 용이)
- UI: 전통적인 화투 느낌 (실제 화투패 이미지, 녹색 바탕)
- 규칙: 표준 룰 (고도리, 청단, 홍단, 초단, 피박, 광박 등)
- AI: 초급/중급/고급 3단계 선택 가능
- 접근성: 큰 글씨/카드 (아버지 편의)
- 게임 방식: 단판 승부
- 추가 기능: 사운드 효과, 통계/전적 기록
- 테스트: TDD 방식

**Research Findings**:
- 화투 이미지: Wikimedia Commons `Hwatu_overview.svg` (CC 라이선스, 48장 전체 포함)
- 참고 구현체: ALee1303/Hwatu (C#, MIT), tmdgns1139/OOP_GoStop (OOP 설계 참고)
- TypeScript 직접 구현체 없음 → 로직 직접 작성
- 빌드 도구: electron-builder (macOS에서 Windows 크로스 빌드 지원)
- 패키지 매니저: npm (Electron 생태계와 완벽 호환)
- 테스트 프레임워크: Vitest (Node.js 생태계 호환, 빠름)

### Metis Review
**Identified Gaps** (addressed):
- 점수 계산 세부 규칙 → 표준 룰 기본값 적용 (피 10장부터 1점, 고 2배 등)
- 특수 규칙 (총통, 폭탄, 흔들기) → 표준으로 포함
- 대상 OS → Windows 전용 확정
- 접근성 → 큰 글씨/카드 적용
- 게임 진행 방식 → 단판 승부

---

## Work Objectives

### Core Objective
아버지께서 Windows PC에서 즐기실 수 있는 2인 고스톱(맞고) 게임 제작. AI와 대전하며 전통적인 화투 느낌의 UI와 사운드로 실제 게임 분위기 제공.

### Concrete Deliverables
- `gostop-setup.exe`: Windows 설치 파일
- 완전한 게임 플레이: 카드 배분 → 턴 진행 → 점수 계산 → 승부 결정
- AI 3단계: 초급(랜덤), 중급(확률 기반), 고급(최적 수 계산)
- 통계: 승률, 총 점수, 게임 횟수 기록

### Definition of Done
- [ ] `npm test` 실행 시 모든 테스트 통과 (커버리지 80% 이상)
- [ ] `npm run make --platform=win32` 실행 시 .exe 파일 생성
- [ ] 게임 한 판 완료 가능 (시작 → 진행 → 종료 → 결과 표시)
- [ ] AI 3단계 모두 동작 확인

### Must Have
- 2인 맞고 규칙 완전 구현 (쪽, 뻑, 폭탄, 총통, 흔들기)
- 표준 족보 (고도리, 청단, 홍단, 초단, 쌍피 등)
- 보너스 점수 (피박, 광박, 멍텅구리, 고 배수)
- 고/스톱 선택 기능
- 큰 글씨/카드 (접근성)
- 사운드 효과
- 전적 기록

### Must NOT Have (Guardrails)
- 온라인 멀티플레이어
- 게임 저장/불러오기
- 튜토리얼
- 3인 고스톱
- 테마/스킨 시스템
- 업적/도전과제
- 자동 업데이트
- 지역별 규칙 변형 옵션
- 애니메이션에 과도한 시간 투자 (기본 애니메이션만)
- macOS 빌드 (Windows 전용)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (새 프로젝트)
- **User wants tests**: TDD
- **Framework**: Vitest (Node.js 생태계 호환, 빠른 HMR 지원)
- **Package Manager**: npm (Electron 생태계와 완벽 호환)

### TDD Workflow

각 TODO는 RED-GREEN-REFACTOR 패턴 따름:

1. **RED**: 실패하는 테스트 먼저 작성
   - Test file: `src/__tests__/{module}.test.ts`
   - Command: `npx vitest run src/__tests__/{module}.test.ts`
   - Expected: FAIL

2. **GREEN**: 테스트 통과하는 최소 코드 구현
   - Command: `npx vitest run src/__tests__/{module}.test.ts`
   - Expected: PASS

3. **REFACTOR**: 코드 정리 (테스트 유지)
   - Command: `npm test`
   - Expected: 전체 PASS

### Test Infrastructure Setup (Task 2에서 수행)
```bash
# vitest 설치: npm install -D vitest
# vitest.config.ts 생성
# package.json에 "test": "vitest run", "test:watch": "vitest" 추가

# 검증
npx vitest --help  # 도움말 출력
npm test           # 테스트 실행
```

### Build Tool Decision
- **Build Tool**: electron-builder (Electron Forge 대신)
- **Reason**: macOS에서 Windows NSIS installer 크로스 빌드 지원
- **Electron Forge는 사용하지 않음**: Forge의 `maker-squirrel`는 Windows에서만 동작하여 macOS 개발 환경에서 Windows 빌드 불가
- **npm scripts**: `npm run build` (TypeScript 컴파일), `npm run dist` (설치 파일 생성)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: 프로젝트 초기화 (Electron + TypeScript)
└── Task 2: 테스트 인프라 설정

Wave 2 (After Wave 1):
├── Task 3: 화투 카드 타입/상수 정의
├── Task 4: 화투 이미지 에셋 준비
└── (parallel) Task 19: 사운드 에셋 준비

Wave 3 (After Task 3):
├── Task 5: 카드 덱 생성 및 셔플
├── Task 6: 게임 상태 관리
├── Task 7: 패 매칭 로직
└── Task 8: 쪽/뻑/폭탄/총통 규칙

Wave 4 (After Wave 3):
├── Task 9: 점수 계산 로직
├── Task 10: 족보 판정 로직
├── Task 11: 고/스톱 선택 로직
├── Task 12: AI 초급 구현
├── Task 13: AI 중급 구현
└── Task 14: AI 고급 구현

Wave 5 (After Wave 4):
├── Task 15: UI - 게임 보드 레이아웃
├── Task 16: UI - 카드 표시
├── Task 17: UI - 점수/족보/상태 표시
├── Task 18: UI - 게임 컨트롤
├── Task 20: 사운드 효과 통합
└── Task 21: 통계 저장/표시

Wave 6 (Final):
├── Task 22: 게임 플로우 통합 테스트
└── Task 23: Windows 빌드 및 패키징
```

### Dependency Matrix

| Task | Depends On | Blocks | Parallel With |
|------|------------|--------|---------------|
| 1 | None | 2, 3, 4, 19 | - |
| 2 | 1 | 3 | - |
| 3 | 2 | 5, 6, 7, 8 | 4, 19 |
| 4 | 1 | 16 | 3, 19 |
| 5 | 3 | 6 | 7, 8 |
| 6 | 3, 5 | 9, 10, 11 | 7, 8 |
| 7 | 3 | 9 | 5, 8 |
| 8 | 3 | 9 | 5, 7 |
| 9 | 6, 7, 8 | 11, 12 | 10 |
| 10 | 6 | 9 | 9, 11 |
| 11 | 9, 10 | 12, 13, 14 | - |
| 12 | 11 | 15 | 13, 14 |
| 13 | 11 | 15 | 12, 14 |
| 14 | 11 | 15 | 12, 13 |
| 15 | 14 | 22 | 16, 17, 18, 20, 21 |
| 16 | 4, 15 | 22 | 15, 17, 18 |
| 17 | 15 | 22 | 16, 18, 20, 21 |
| 18 | 15 | 22 | 16, 17, 20, 21 |
| 19 | 1 | 20 | 3, 4 |
| 20 | 15, 19 | 22 | 17, 18, 21 |
| 21 | 15 | 22 | 17, 18, 20 |
| 22 | 15-21 | 23 | - |
| 23 | 22 | None | - |

---

## TODOs

### Wave 1: 프로젝트 기반

- [ ] 1. 프로젝트 초기화 (Electron + TypeScript + electron-builder)

  **What to do**:
  - `npm init -y`로 프로젝트 생성
  - Electron, TypeScript, electron-builder 설치
    - `npm install --save-dev electron typescript electron-builder`
    - `npm install --save-dev ts-loader webpack webpack-cli html-webpack-plugin`
  - 기본 디렉토리 구조 설정:
    ```
    src/
    ├── main/           # Electron 메인 프로세스
    │   └── main.ts
    ├── renderer/       # UI (HTML/CSS/TS)
    │   ├── index.html
    │   └── renderer.ts
    ├── preload/
    │   └── preload.ts
    ├── game/           # 게임 로직 (순수 함수)
    ├── ai/             # AI 로직
    ├── store/          # 통계 저장
    ├── assets/         # 이미지, 사운드
    │   ├── cards/
    │   └── sounds/
    └── __tests__/      # 테스트
    ```
  - TypeScript strict 모드 설정 (`tsconfig.json`)
  - Webpack 설정 (메인/렌더러 프로세스 분리)
  - electron-builder 설정 (`electron-builder.yml` 또는 `package.json` 내 `build` 필드):
    ```yaml
    # electron-builder.yml
    appId: com.gostop.app
    productName: 고스톱
    win:
      target: nsis
    nsis:
      oneClick: true
      installerIcon: build/icon.ico
    ```
  - npm scripts 설정:
    - `"start"`: Electron 개발 모드 실행
    - `"build"`: TypeScript 컴파일 + Webpack 번들링
    - `"dist"`: electron-builder로 설치 파일 생성
    - `"dist:win"`: `electron-builder --win` (macOS에서 Windows 크로스 빌드)

  **Must NOT do**:
  - Electron Forge 사용하지 말 것 (electron-builder 사용, macOS에서 Windows 크로스 빌드 지원)
  - macOS 전용 설정 추가하지 말 것 (Windows 타겟만)
  - 불필요한 의존성 추가하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 프로젝트 설정, Webpack/electron-builder 구성이 필요
  - **Skills**: [`playwright`]
    - `playwright`: 추후 E2E 테스트 환경 확인에 필요

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (단독)
  - **Blocks**: Tasks 2, 3, 4, 19
  - **Blocked By**: None

  **References**:
  - electron-builder 공식 문서: https://www.electron.build/
  - electron-builder 크로스 빌드: https://www.electron.build/multi-platform-build
  - macOS에서 Windows NSIS 빌드 가능 (Wine 없이도 NSIS installer 크로스 컴파일 지원)
  - Webpack + TypeScript + Electron 설정 예시: https://github.com/nicedoc/electron-boilerplate

  **Acceptance Criteria**:
  ```bash
  # 프로젝트 구조 확인
  ls -la src/main/ src/renderer/ src/preload/ src/game/ src/ai/
  # Expected: 각 디렉토리와 기본 파일 존재

  # TypeScript 컴파일 확인
  npx tsc --noEmit
  # Expected: 에러 없이 완료

  # Webpack 빌드 확인
  npm run build
  # Expected: dist/ 디렉토리에 번들 파일 생성

  # Electron 앱 실행 확인 (개발 모드)
  npm run start &
  sleep 5
  pgrep -f "electron"
  # Expected: PID 출력
  pkill -f "electron"

  # electron-builder 설정 검증
  npx electron-builder --help
  # Expected: 도움말 출력 (설치 확인)
  ```

  **Commit**: YES
  - Message: `chore: initialize Electron project with TypeScript and electron-builder`
  - Files: `package.json`, `tsconfig.json`, `webpack.config.js`, `electron-builder.yml`, `src/**`

---

- [ ] 2. 테스트 인프라 설정 (Vitest)

  **What to do**:
  - Vitest 설치: `npm install -D vitest`
  - `vitest.config.ts` 생성:
    ```typescript
    import { defineConfig } from 'vitest/config';
    export default defineConfig({
      test: {
        include: ['src/__tests__/**/*.test.ts'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'html'],
          include: ['src/game/**', 'src/ai/**', 'src/store/**'],
        },
      },
    });
    ```
  - package.json scripts 추가:
    ```json
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
    ```
  - 테스트 디렉토리 구조 생성 (`src/__tests__/`)
  - 예제 테스트 파일 생성하여 설정 검증

  **Must NOT do**:
  - Jest 사용하지 말 것 (Vitest가 더 빠르고 TypeScript 네이티브 지원)
  - bun test 사용하지 말 것 (Electron/npm 생태계와 호환성 보장을 위해)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 설정 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (Task 1 완료 후)
  - **Parallel Group**: Wave 1 (Task 1 이후)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - Vitest 공식 문서: https://vitest.dev/
  - Vitest 설정 가이드: https://vitest.dev/config/

  **Acceptance Criteria**:
  ```bash
  # 테스트 실행
  npm test
  # Expected: 테스트 실행됨 (exit code 0)

  # 예제 테스트 실행
  npx vitest run src/__tests__/example.test.ts
  # Expected: PASS

  # 커버리지 확인
  npm run test:coverage
  # Expected: 커버리지 리포트 출력 (text 형식)
  ```

  **Commit**: YES
  - Message: `chore: setup Vitest test infrastructure`
  - Files: `vitest.config.ts`, `src/__tests__/example.test.ts`, `package.json`

---

### Wave 2: 기본 타입 및 에셋

- [ ] 3. 화투 카드 타입/상수 정의

  **What to do**:
  - Month enum (1월~12월)
  - CardType enum (광, 열끗, 띠, 피)
  - Card interface 정의
  - 48장 전체 카드 상수 배열 정의
  - 각 카드의 고유 ID, 월, 타입, 이미지 경로 포함

  **Must NOT do**:
  - 게임 로직 구현하지 말 것 (타입/상수만)
  - 추가 카드 타입 만들지 말 것 (48장 고정)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 타입 정의만, 복잡한 로직 없음
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 19)
  - **Blocks**: Tasks 5, 6, 7, 8
  - **Blocked By**: Task 2

  **References**:
  - 화투 구성: 12월 x 4장 = 48장
  - 광 (5장): 1월 송학, 3월 벚꽃만개, 8월 공산명월, 11월 오동, 12월 비광
  - 열끗 (9장): 2월 새, 4월 두견새, 5월 다리, 6월 나비, 7월 멧돼지, 8월 기러기, 9월 술잔, 10월 사슴, 12월 비열끗
  - 띠 (10장): 홍단 3장(1,2,3월), 청단 3장(6,9,10월), 초단 3장(4,5,7월), 비띠 1장(11월)
  - 피 (24장): 나머지 + 쌍피 2장(11월, 12월)

  **Acceptance Criteria**:
  ```bash
  # TDD: 테스트 먼저 작성 후 구현
  npx vitest run src/__tests__/cards.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - CARDS 배열 길이 === 48
  # - 각 월별 카드 4장씩 존재
  # - 광 카드 5장 존재
  # - 열끗 9장, 띠 10장, 피 24장 검증
  # - 각 카드 id 고유성 검증
  ```

  **Commit**: YES
  - Message: `feat(game): define Hwatu card types and constants`
  - Files: `src/game/cards.ts`, `src/__tests__/cards.test.ts`

---

- [ ] 4. 화투 이미지 에셋 준비

  **What to do**:
  - Wikimedia Commons Category:SVG Hwatu에서 월별 SVG 파일 다운로드
  - **이미지 소스 전략 (구체적 방법)**:
    - 1차 시도: Category:SVG Hwatu의 개별 카드 파일들 사용 (Hwatu_January_Gwang.svg 등)
    - 2차 시도 (개별 파일 없을 경우): 월별 SVG 파일 (Hwatu001.svg ~ Hwatu012.svg, 각 월 4장이 하나의 파일)을 다운로드 후 개별 카드로 분리
    - 분리 방법: `sharp` npm 패키지 또는 ImageMagick의 `convert` 명령어 사용
      ```bash
      # 예시: ImageMagick으로 월별 SVG에서 개별 카드 추출 (4등분)
      convert Hwatu001.svg -crop 25%x100% +repage january-%d.png
      ```
    - 3차 시도 (분리 곤란 시): `Hwatu_overview.svg` (1326×732px, 12×4 그리드)에서 그리드 기반 추출
      ```bash
      # 예시: overview에서 그리드 추출 (110.5x183px per card)
      convert Hwatu_overview.svg -crop 110x183 +repage card-%d.png
      ```
  - 추출한 PNG를 150x220px 이상으로 리사이즈 (접근성: 큰 카드)
  - **파일 네이밍 컨벤션** (Task 3의 카드 ID와 매핑):
    - `{month}-{type}.png` 형식: `january-gwang.png`, `february-bird.png`, `march-curtain.png` 등
    - 같은 타입이 여러 장인 경우: `january-pi-1.png`, `january-pi-2.png`
  - 카드 뒷면 이미지: 단색 또는 간단한 패턴으로 직접 생성 (SVG/CSS로 가능)
  - `src/assets/cards/` 디렉토리에 저장
  - `ATTRIBUTION.md` 파일에 CC BY-SA 저작자 표기 (Marcus Richert)

  **Must NOT do**:
  - 커스텀 디자인 제작하지 말 것 (기존 에셋 활용)
  - 너무 작은 해상도 사용하지 말 것 (접근성: 최소 150x220px)
  - 라이선스 위반하지 말 것 (CC BY-SA 준수)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 이미지 다운로드, 분리, 리사이즈 작업 필요
  - **Skills**: [`dev-browser`]
    - `dev-browser`: Wikimedia에서 이미지 다운로드에 활용

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 19)
  - **Blocks**: Task 16
  - **Blocked By**: Task 1

  **References**:
  - 개별 SVG: https://commons.wikimedia.org/wiki/Category:SVG_Hwatu (53개 파일)
  - 월별 SVG: https://commons.wikimedia.org/wiki/Category:Hwatu (Hwatu001~012)
  - 전체 개요: https://commons.wikimedia.org/wiki/File:Hwatu_overview.svg
  - 라이선스: CC BY-SA 4.0 (저작자: Marcus Richert)
  - sharp npm 패키지: https://sharp.pixelplumbing.com/ (이미지 처리)
  - ImageMagick crop: https://imagemagick.org/script/command-line-options.php#crop
  - **Wikimedia 파일명 → 한국어 카드 타입 매핑**:
    | Wikimedia 명칭 (일본어) | 한국어 타입 | 설명 |
    |------------------------|------------|------|
    | Hikari (光) | 광 | 20점 카드 |
    | Tane (種) | 열끗 | 10점 카드 (동물) |
    | Tanzaku (短冊) | 띠 | 5점 카드 (리본) |
    | Kasu (カス) | 피 | 1점 카드 |

  **Acceptance Criteria**:
  ```bash
  # 에셋 디렉토리 확인
  ls src/assets/cards/
  # Expected: 48개 카드 이미지 파일 + 뒷면 이미지 (card-back.png)

  # 파일 개수 확인
  ls src/assets/cards/*.png | wc -l
  # Expected: 49 (48장 + 뒷면 1장)

  # 이미지 크기 확인
  file src/assets/cards/january-gwang.png
  # Expected: PNG image data, 150 x 220 (또는 그 이상)

  # 라이선스 표기 확인
  cat ATTRIBUTION.md | grep -i "Marcus Richert"
  # Expected: 저작자 이름 포함

  # 파일명-카드 매핑 확인 (각 월별 4장)
  ls src/assets/cards/january-*.png | wc -l
  # Expected: 4 (광, 학, 홍단, 피)
  ```

  **Commit**: YES
  - Message: `feat(assets): add Hwatu card images from Wikimedia Commons`
  - Files: `src/assets/cards/**`, `ATTRIBUTION.md`

---

- [ ] 19. 사운드 에셋 준비

  **What to do**:
  - 무료 효과음 사이트에서 다운로드 (freesound.org, pixabay 등)
  - 필요한 사운드: 카드 배분, 카드 놓기, 쪽, 족보 완성, 고, 스톱, 승리, 패배
  - 적절한 포맷 (mp3 또는 wav)
  - `src/assets/sounds/` 디렉토리에 저장

  **Must NOT do**:
  - 배경음악 추가하지 말 것 (요청하지 않음)
  - 라이선스 문제 있는 사운드 사용하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 에셋 다운로드 및 정리
  - **Skills**: [`dev-browser`]
    - `dev-browser`: 웹에서 사운드 다운로드

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 20
  - **Blocked By**: Task 1

  **References**:
  - Freesound: https://freesound.org/
  - Pixabay Sounds: https://pixabay.com/sound-effects/
  - 필요 사운드 목록:
    - card-deal.mp3 (카드 배분)
    - card-place.mp3 (카드 놓기)
    - card-match.mp3 (쪽/패 먹기)
    - combo.mp3 (족보 완성)
    - go.mp3 (고 선언)
    - stop.mp3 (스톱 선언)
    - win.mp3 (승리)
    - lose.mp3 (패배)

  **Acceptance Criteria**:
  ```bash
  # 에셋 디렉토리 확인
  ls src/assets/sounds/
  # Expected: 8개 이상 사운드 파일

  # 파일 형식 확인
  file src/assets/sounds/card-place.mp3
  # Expected: Audio file with ID3 또는 MPEG audio
  ```

  **Commit**: YES
  - Message: `feat(assets): add sound effects`
  - Files: `src/assets/sounds/**`

---

### Wave 3: 게임 로직 기본

- [ ] 5. 카드 덱 생성 및 셔플

  **What to do**:
  - 48장 덱 생성 함수
  - Fisher-Yates 셔플 알고리즘 구현
  - 초기 배분 함수 (플레이어 10장, AI 10장, 바닥 8장, 나머지 덱)
  - 순수 함수로 구현 (사이드 이펙트 없음)

  **Must NOT do**:
  - 난수 시드 고정하지 말 것 (실제 랜덤 필요)
  - 게임 상태 직접 수정하지 말 것 (불변성 유지)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순한 유틸리티 함수
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 8)
  - **Blocks**: Task 6
  - **Blocked By**: Task 3

  **References**:
  - Fisher-Yates 셔플: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  - Task 3에서 정의한 `CARDS` 상수 사용

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/deck.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - createDeck(): 48장 반환
  # - shuffle(): 원본 변경 없이 새 배열 반환
  # - shuffle(): 충분히 섞임 (연속 호출 시 다른 결과)
  # - dealCards(): 플레이어 10장, AI 10장, 바닥 8장, 덱 20장
  # - dealCards(): 모든 카드 고유성 유지
  ```

  **Commit**: YES
  - Message: `feat(game): implement deck creation and shuffle logic`
  - Files: `src/game/deck.ts`, `src/__tests__/deck.test.ts`

---

- [ ] 6. 게임 상태 관리

  **What to do**:
  - GameState 인터페이스 정의
  - 초기 상태 생성 함수
  - 상태 업데이트 함수들 (불변성 유지)
  - 현재 턴, 페이즈 관리

  **Must NOT do**:
  - 전역 상태 사용하지 말 것
  - 상태 직접 변경하지 말 것 (항상 새 객체 반환)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 상태 관리 설계 필요하지만 복잡하지 않음
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 7, 8)
  - **Blocks**: Tasks 9, 10, 11
  - **Blocked By**: Tasks 3, 5

  **References**:

  **턴 진행 시퀀스 (한 턴의 상세 플로우)**:
  ```
  한 턴 = 6단계:

  1. [select-hand]   플레이어/AI가 손패에서 카드 1장 선택
  2. [match-hand]    선택한 카드와 바닥 매칭 확인
                     - 같은 월 0장: 바닥에 내려놓음
                     - 같은 월 1장: 둘 다 획득
                     - 같은 월 2장: 쪽! 3장 모두 획득 (Task 8)
                     - 같은 월 3장: 4장 모두 획득 (Task 8)
  3. [flip-deck]     덱에서 카드 1장 뒤집기
  4. [match-deck]    뒤집은 카드와 바닥 매칭 확인 (같은 규칙)
                     - 주의: 2단계에서 바닥에 놓은 카드와도 매칭 가능
  5. [check-score]   점수 확인 → 7점 이상이면 고/스톱 선택 트리거
  6. [go-stop]       고 선택 시 게임 계속 / 스톱 선택 시 종료
                     → 7점 미만이면 이 단계 건너뜀
  → 턴 전환 (상대방 차례)
  ```

  **상태 구조** (phase가 턴 시퀀스에 정확히 매핑):
  ```typescript
  type Phase =
    | 'waiting'       // 게임 시작 전
    | 'select-hand'   // 손패에서 카드 선택
    | 'match-hand'    // 손패 카드 바닥 매칭 처리
    | 'flip-deck'     // 덱에서 카드 뒤집기
    | 'match-deck'    // 뒤집은 카드 바닥 매칭 처리
    | 'check-score'   // 점수 확인
    | 'go-stop'       // 고/스톱 선택 (7점 이상일 때만)
    | 'end';          // 게임 종료

  interface GameState {
    playerHand: Card[];
    aiHand: Card[];
    field: Card[];
    deck: Card[];
    playerCapture: Card[];
    aiCapture: Card[];
    currentTurn: 'player' | 'ai';
    phase: Phase;
    goCount: { player: number; ai: number };
    selectedCard: Card | null;      // select-hand에서 선택한 카드
    flippedCard: Card | null;       // flip-deck에서 뒤집은 카드
    lastAction: Action | null;
    shakingMultiplier: number;      // 흔들기 배수 (기본 1)
  }
  ```

  **Phase 전이 다이어그램**:
  ```
  waiting → select-hand → match-hand → flip-deck → match-deck → check-score
      ↑                                                              │
      │         ┌──────── go-stop ←───── (7점 이상) ────────────────┘
      │         │            │                    │
      │         │ (고 선택)  │ (스톱 선택)        │ (7점 미만)
      │         ▼            ▼                    ▼
      └── select-hand      end             select-hand (턴 전환)
          (상대 턴)                         (상대 턴)
  ```

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/state.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - createInitialState(): 올바른 초기 상태 반환 (phase='waiting')
  # - 상태 불변성: 업데이트 시 원본 변경 안 됨
  # - 턴 전환 함수 동작 (player ↔ ai)
  # - Phase 전이: waiting → select-hand → match-hand → flip-deck → match-deck → check-score
  # - 7점 이상 시 go-stop phase로 전이
  # - 7점 미만 시 check-score에서 바로 select-hand (턴 전환)으로 전이
  # - 스톱 시 end로 전이
  # - 고 시 goCount 증가 후 select-hand로 전이
  ```

  **Commit**: YES
  - Message: `feat(game): implement game state management with turn sequence`
  - Files: `src/game/state.ts`, `src/__tests__/state.test.ts`

---

- [ ] 7. 패 매칭 로직

  **What to do**:
  - 같은 월 카드 찾기 함수
  - 유효한 수(플레이 가능한 카드) 계산 함수
  - 매칭 결과 계산 (가져갈 카드들)
  - 덱에서 뒤집은 카드와의 매칭도 처리

  **Must NOT do**:
  - 쪽/뻑 규칙은 여기서 구현하지 말 것 (Task 8에서)
  - UI 관련 코드 포함하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 명확한 규칙 기반 로직
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 3

  **References**:
  - 기본 매칭 규칙 (같은 월 카드가 0~1장인 경우만):
    - 같은 월 카드 0장: 바닥에 내려놓음
    - 같은 월 카드 1장: 둘 다 획득 (가져감)
    - 같은 월 카드 2장 이상: → Task 8에서 처리 (쪽/뻑)
    - 덱에서 뒤집은 카드도 같은 규칙 적용
  - **Task 8과의 통합**: 매칭 시 먼저 Task 8의 특수 규칙(쪽/뻑) 해당 여부를 확인하고, 해당 없으면 이 모듈의 기본 매칭 적용

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/matching.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - findMatchingCards(): 같은 월 카드 정확히 찾음
  # - getValidMoves(): 유효한 수 목록 반환
  # - 매칭 없을 때 바닥에 추가
  # - 매칭 있을 때 양쪽 카드 획득
  ```

  **Commit**: YES
  - Message: `feat(game): implement card matching logic`
  - Files: `src/game/matching.ts`, `src/__tests__/matching.test.ts`

---

- [ ] 8. 쪽/뻑/폭탄/총통/흔들기 규칙 구현

  **What to do**:
  - **쪽**: 바닥에 같은 월 2장 + 손패/덱에서 1장 → 3장 모두 획득. 상대 피 1장 뺏기.
  - **뻑**: 바닥에 같은 월 3장 + 4번째 장 → 4장 모두 획득.
  - **폭탄**: 손패에 같은 월 3장 보유 시, 턴 시작 때 3장을 바닥에 내려놓고 바닥의 같은 월 카드와 함께 모두 획득. 상대 피 1장 뺏기.
  - **총통**: 손패에 같은 월 4장 보유 시, 즉시 공개하여 4장 모두 획득. 상대 피 2장 뺏기.
  - **흔들기 (상세 규칙)**:
    - **선언 조건**: 바닥에 같은 월 카드가 2장 있고, 손패에도 같은 월 카드가 1장 있을 때
    - **선언 시점**: 카드를 내기 전, "흔들기" 선언 가능 (선택사항, 강제 아님)
    - **성공 조건**: 흔들기 선언 후 카드를 내서 쪽(3장 획득)에 성공하면 "흔들기 성공"
    - **배수**: 흔들기 성공 시 최종 점수 **2배** (다른 배수와 곱연산)
    - **실패**: 덱에서 뒤집은 카드가 같은 월이어서 뻑이 되면 실패, 배수 취소
    - **중첩**: 한 판에 여러 번 흔들기 가능 → 각 성공 시 2배씩 곱함 (2번 성공 = 4배)

  **Must NOT do**:
  - 지역 변형 규칙 추가하지 말 것
  - 복잡한 규칙 옵션 제공하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 복잡한 규칙 조합, 엣지 케이스 다수
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 3

  **References**:
  - 쪽: 바닥 2장 + 손패/덱 1장 = 3장 획득 + 상대 피 1장 뺏기
  - 뻑: 바닥 3장 + 4번째 장 = 4장 획득
  - 폭탄: 손패 3장 + 바닥 0~1장 = 전부 획득 + 상대 피 1장 뺏기
  - 총통: 손패 4장 = 전부 획득 + 상대 피 2장 뺏기
  - 흔들기: 선언(선택) → 카드 내기 → 쪽 성공 시 2배 / 뻑 발생 시 취소

  **Task 7과의 경계 명확화**:
  - Task 7(패 매칭): 기본 매칭 로직만 (같은 월 1장 매칭, 매칭 없을 때 바닥 추가)
  - Task 8(특수 규칙): 쪽(2장 매칭), 뻑(3장 매칭), 폭탄, 총통, 흔들기
  - **통합 순서**: 턴 진행 시 Task 8의 특수 규칙을 먼저 확인 → 해당 없으면 Task 7의 기본 매칭 적용
  - **같은 월 바닥 2장일 때 선택**: 플레이어가 어느 카드와 매칭할지 선택하는 것이 아니라, 쪽으로 3장 모두 가져감 (선택 불필요)

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/special-rules.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - detectJjok(): 쪽 상황 감지 (바닥 같은 월 2장 + 내 카드 1장)
  # - detectPpuk(): 뻑 상황 감지 (바닥 같은 월 3장)
  # - detectBomb(): 폭탄 상황 감지 (손패 같은 월 3장)
  # - detectChongtong(): 총통 상황 감지 (손패 같은 월 4장)
  # - applyJjok(): 쪽 효과 적용 (3장 획득 + 상대 피 1장 뺏기)
  # - applyBomb(): 폭탄 효과 적용 (전부 획득 + 상대 피 1장 뺏기)
  # - applyChongtong(): 총통 효과 적용 (4장 획득 + 상대 피 2장 뺏기)
  # - canShake(): 흔들기 가능 여부 판단
  # - applyShake(): 흔들기 선언 후 성공 시 배수 2배
  # - applyShake(): 흔들기 선언 후 뻑 발생 시 배수 취소
  # - applyShake(): 다중 흔들기 성공 시 배수 곱연산 (2 * 2 = 4)
  ```

  **Commit**: YES
  - Message: `feat(game): implement special rules (jjok, ppuk, bomb, chongtong, shake)`
  - Files: `src/game/special-rules.ts`, `src/__tests__/special-rules.test.ts`

---

### Wave 4: 점수 및 AI

- [ ] 9. 점수 계산 로직

  **What to do**:
  - 피 점수: 10장부터 1점, 이후 장당 1점, 쌍피 2장 계산
  - 광 점수: 3광 3점, 비광 포함 3광 2점, 4광 4점, 5광 15점
  - 띠 점수: 5장 1점, 이후 장당 1점
  - 열끗 점수: 5장 1점, 이후 장당 1점
  - 보너스: 피박(2배, 상대 피 점수 0점일 때), 광박(2배, 상대 광 점수 0점일 때), 멍텅구리(2배, 상대 열끗 0장으로 승리 시)
  - 총점 계산 함수

  **Must NOT do**:
  - 지역별 변형 점수 규칙 추가하지 말 것
  - 점수 옵션 설정 추가하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 복잡한 점수 계산 규칙, 많은 조합
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 10, 11)
  - **Blocks**: Tasks 11, 12
  - **Blocked By**: Tasks 6, 7, 8

  **References**:
  - 광 점수표:
    - 비광 제외 3광: 3점
    - 비광 포함 3광: 2점
    - 4광: 4점
    - 5광: 15점
  - 띠/열끗/피 기본 점수: 5장 1점, 추가 장당 +1점
  - 피 시작 장수: 10장 (쌍피는 2장으로 계산)

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/scoring.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - calculatePiScore(): 피 10장=1점, 11장=2점, 쌍피 계산
  # - calculateGwangScore(): 3광/4광/5광/비광 처리
  # - calculateTtiScore(): 5장=1점, 추가 장당 +1
  # - calculateYeolScore(): 5장=1점, 추가 장당 +1
  # - calculateTotal(): 전체 합산
  # - applyBonus(): 피박/광박/멍텅구리 배수 적용
  ```

  **Commit**: YES
  - Message: `feat(game): implement scoring system`
  - Files: `src/game/scoring.ts`, `src/__tests__/scoring.test.ts`

---

- [ ] 10. 족보 판정 로직

  **What to do**:
  - 고도리: 2월, 4월, 8월 열끗 (새 3마리)
  - 청단: 6월, 9월, 10월 청색 띠
  - 홍단: 1월, 2월, 3월 홍색 띠 (글씨 있음)
  - 초단: 4월, 5월, 7월 초색 띠 (글씨 없음)
  - 각 족보 5점 추가

  **Must NOT do**:
  - 지역 변형 족보 추가하지 말 것
  - 족보 옵션 설정 추가하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 명확한 규칙 기반, 패턴 매칭
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 9, 11)
  - **Blocks**: Task 9 (점수 계산에서 족보 점수 포함)
  - **Blocked By**: Task 6

  **References**:
  - 고도리 카드: 2월 열끗(새), 4월 열끗(두견새), 8월 열끗(기러기)
  - 청단 카드: 6월 띠, 9월 띠, 10월 띠 (청색)
  - 홍단 카드: 1월 띠, 2월 띠, 3월 띠 (홍색, 글씨)
  - 초단 카드: 4월 띠, 5월 띠, 7월 띠 (초색, 무글씨)

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/combos.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - hasGodori(): 고도리 감지
  # - hasChungdan(): 청단 감지
  # - hasHongdan(): 홍단 감지
  # - hasChodan(): 초단 감지
  # - getCombos(): 완성된 족보 목록 반환
  # - getComboScore(): 족보 총점 계산 (각 5점)
  ```

  **Commit**: YES
  - Message: `feat(game): implement combo detection (godori, dan patterns)`
  - Files: `src/game/combos.ts`, `src/__tests__/combos.test.ts`

---

- [ ] 11. 고/스톱 선택 로직

  **What to do**:
  - 7점 이상 도달 시 고/스톱 선택 트리거
  - 고 선택: 게임 계속, goCount 증가
  - 스톱 선택: 게임 종료, 점수 정산
  - 고 후 역전당하면 배수로 뺏김
  - 고 배수: 1고=2배, 2고=4배, 3고=8배...

  **Must NOT do**:
  - 자동 고/스톱 결정하지 말 것 (플레이어 선택 필요)
  - AI의 고/스톱은 별도 Task에서 처리

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 명확한 규칙
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (Tasks 9, 10 완료 후)
  - **Parallel Group**: Wave 4 (after Tasks 9, 10)
  - **Blocks**: Tasks 12, 13, 14
  - **Blocked By**: Tasks 9, 10

  **References**:
  - 고 배수: 2^goCount
  - 역전: 고 선언 후 상대가 먼저 7점 도달하면 내 점수 * 고배수만큼 상대에게 줌

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/go-stop.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - canGoOrStop(): 7점 이상일 때만 true
  # - selectGo(): goCount 증가, 게임 계속
  # - selectStop(): 게임 종료, 최종 점수 계산
  # - calculateGoMultiplier(): 고 배수 정확히 계산
  # - handleReversal(): 역전 시 점수 뺏김 처리
  ```

  **Commit**: YES
  - Message: `feat(game): implement go/stop selection logic`
  - Files: `src/game/go-stop.ts`, `src/__tests__/go-stop.test.ts`

---

- [ ] 12. AI 초급 구현

  **What to do**:
  - 유효한 수 중 랜덤 선택
  - 고/스톱 선택: 랜덤 (70% 스톱, 30% 고)
  - 특수 상황에서도 단순 랜덤

  **Must NOT do**:
  - 확률 계산이나 최적화 추가하지 말 것
  - 복잡한 전략 로직 추가하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 랜덤 로직
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 14)
  - **Blocks**: Task 15
  - **Blocked By**: Task 11

  **References**:
  - Task 7의 `getValidMoves()` 함수 사용
  - 랜덤 선택: `Math.random()`

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/ai-easy.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - selectMove(): 항상 유효한 수 반환
  # - selectMove(): 여러 번 호출 시 다양한 결과 (랜덤성)
  # - selectGoStop(): 유효한 선택 반환 ('go' | 'stop')
  # - AI 응답 시간 < 100ms
  ```

  **Commit**: YES
  - Message: `feat(ai): implement easy difficulty AI (random selection)`
  - Files: `src/ai/easy.ts`, `src/__tests__/ai-easy.test.ts`

---

- [ ] 13. AI 중급 구현

  **What to do**:
  - 기본 확률 계산 기반 선택
  - 광 카드 우선 획득
  - 족보 진행 중인 카드 우선
  - 고/스톱: 점수 차이에 따른 결정 (리드 크면 스톱)

  **Must NOT do**:
  - 완벽한 최적화 추가하지 말 것 (Task 14에서)
  - 복잡한 예측 알고리즘 추가하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 기본 휴리스틱 기반
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 14)
  - **Blocks**: Task 15
  - **Blocked By**: Task 11

  **References**:
  - 우선순위: 광 > 족보 진행 카드 > 열끗 > 띠 > 피
  - 고/스톱 기준: 10점 이상 리드 시 스톱, 아니면 상황에 따라

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/ai-medium.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - selectMove(): 광 획득 가능 시 광 우선
  # - selectMove(): 족보 완성 가능 시 해당 카드 우선
  # - selectGoStop(): 점수 차이에 따른 합리적 결정
  # - AI 응답 시간 < 500ms
  ```

  **Commit**: YES
  - Message: `feat(ai): implement medium difficulty AI (heuristic-based)`
  - Files: `src/ai/medium.ts`, `src/__tests__/ai-medium.test.ts`

---

- [ ] 14. AI 고급 구현

  **What to do**:
  - 기대값 최대화 알고리즘
  - 남은 카드 추적 (상대 패, 덱 추정)
  - 최적 수 계산 (몇 수 앞 예측)
  - 고/스톱: 기대값 기반 결정

  **Must NOT do**:
  - 완벽한 예측 (치팅) 추가하지 말 것
  - 계산에 2초 이상 걸리지 말 것

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 복잡한 알고리즘 설계, 최적화 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 13)
  - **Blocks**: Task 15
  - **Blocked By**: Task 11

  **References**:
  - 기대값 계산: 각 수의 예상 점수 이득 계산
  - 남은 카드 추적: 공개된 카드 제외한 나머지 확률 분포

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/ai-hard.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - selectMove(): 광/족보 완성 기회 시 최적 선택
  # - selectMove(): 상대 족보 방해 시도
  # - selectGoStop(): 기대값 기반 합리적 결정
  # - AI 응답 시간 < 1000ms
  # - 중급 AI보다 높은 승률 (시뮬레이션 테스트)
  ```

  **Commit**: YES
  - Message: `feat(ai): implement hard difficulty AI (expectation maximization)`
  - Files: `src/ai/hard.ts`, `src/__tests__/ai-hard.test.ts`

---

### Wave 5: UI 및 통합

- [ ] 15. UI - 게임 보드 레이아웃

  **What to do**:
  - 전체 레이아웃: 상단(AI 영역), 중앙(바닥), 하단(플레이어 영역)
  - 녹색 바탕 (전통 화투판 느낌)
  - 반응형 레이아웃 (창 크기 조절 대응)
  - 큰 카드 크기 (접근성)

  **Must NOT do**:
  - 복잡한 애니메이션 추가하지 말 것
  - 테마/스킨 옵션 추가하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI/레이아웃 설계
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: UI 디자인 전문

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 16-21)
  - **Blocks**: Task 22
  - **Blocked By**: Task 14

  **References**:
  - 레이아웃 구조:
    ```
    +---------------------------+
    |    AI 획득패 | AI 손패    |
    +---------------------------+
    |         바닥 (8칸)        |
    +---------------------------+
    |  플레이어 손패 | 획득패   |
    +---------------------------+
    |     점수 | 족보 | 조작    |
    +---------------------------+
    ```

  **Acceptance Criteria**:
  ```bash
  # 개발 서버 실행 후 Playwright 테스트
  npm run start &
  sleep 5

  # Playwright로 레이아웃 검증
  npx playwright test e2e/layout.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - 게임 보드 영역 존재
  # - 녹색 배경색 확인
  # - 플레이어/AI/바닥 영역 존재
  # - 창 크기 조절 시 레이아웃 유지

  pkill -f "electron"
  ```

  **Commit**: YES
  - Message: `feat(ui): implement game board layout`
  - Files: `src/renderer/styles.css`, `src/renderer/index.html`, `src/renderer/App.ts`

---

- [ ] 16. UI - 카드 표시

  **What to do**:
  - 카드 컴포넌트 (이미지 표시)
  - 카드 선택 상태 표시 (테두리, 하이라이트)
  - 카드 뒷면 표시 (AI 손패)
  - 클릭 이벤트 핸들링
  - 호버 효과 (선택 가능한 카드 표시)

  **Must NOT do**:
  - 복잡한 애니메이션 추가하지 말 것 (기본 페이드/슬라이드만)
  - 3D 효과 추가하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 카드 UI 구현
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 15, 17-21)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 4, 15

  **References**:
  - Task 4에서 준비한 이미지 사용
  - 카드 크기: 약 120x180px (큰 사이즈)

  **Acceptance Criteria**:
  ```bash
  npx playwright test e2e/cards.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - 카드 이미지 정상 로드 (src 속성 확인)
  # - 카드 클릭 시 선택 상태 변경
  # - AI 손패는 뒷면으로 표시
  # - 호버 시 시각적 피드백
  ```

  **Commit**: YES
  - Message: `feat(ui): implement card display component`
  - Files: `src/renderer/components/Card.ts`, `src/renderer/components/Card.css`

---

- [ ] 17. UI - 점수/족보/상태 표시

  **What to do**:
  - 현재 점수 표시 (플레이어/AI)
  - 완성된 족보 목록 표시
  - 현재 턴 표시
  - 고 횟수 표시
  - 메시지 영역 (족보 완성, 쪽, 폭탄 등 알림)

  **Must NOT do**:
  - 과도한 정보 표시하지 말 것 (핵심만)
  - 복잡한 통계 실시간 표시하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 구현
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 15, 16, 18, 20, 21)
  - **Blocks**: Task 22
  - **Blocked By**: Task 15

  **References**:
  - 점수 표시 위치: 하단 왼쪽
  - 족보 표시: 아이콘 또는 텍스트 배지
  - 메시지: 화면 중앙 상단에 팝업 형태

  **Acceptance Criteria**:
  ```bash
  npx playwright test e2e/score-display.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - 점수 영역 존재 및 0 표시
  # - 족보 완성 시 표시 업데이트
  # - 턴 표시 정확
  # - 메시지 영역 동작
  ```

  **Commit**: YES
  - Message: `feat(ui): implement score and status display`
  - Files: `src/renderer/components/ScoreBoard.ts`, `src/renderer/components/Message.ts`

---

- [ ] 18. UI - 게임 컨트롤

  **What to do**:
  - 게임 시작 버튼
  - 난이도 선택 (초급/중급/고급)
  - 고/스톱 버튼 (7점 이상 시 활성화)
  - 새 게임 버튼
  - 설정 메뉴 (사운드 on/off)

  **Must NOT do**:
  - 복잡한 설정 옵션 추가하지 말 것
  - 게임 저장/불러오기 추가하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 구현
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 15-17, 20, 21)
  - **Blocks**: Task 22
  - **Blocked By**: Task 15

  **References**:
  - 난이도 선택: 라디오 버튼 또는 드롭다운
  - 고/스톱 버튼: 게임 중 항상 표시, 조건 충족 시 활성화

  **Acceptance Criteria**:
  ```bash
  npx playwright test e2e/controls.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - 시작 버튼 클릭 시 게임 시작
  # - 난이도 선택 동작
  # - 고/스톱 버튼 조건부 활성화
  # - 새 게임 버튼 동작
  # - 사운드 토글 동작
  ```

  **Commit**: YES
  - Message: `feat(ui): implement game controls`
  - Files: `src/renderer/components/Controls.ts`, `src/renderer/components/Settings.ts`

---

- [ ] 20. 사운드 효과 통합

  **What to do**:
  - Howler.js 또는 Web Audio API 사용
  - 각 이벤트에 사운드 연결
  - 사운드 on/off 설정 반영
  - 볼륨 조절 (선택적)

  **Must NOT do**:
  - 배경음악 추가하지 말 것
  - 복잡한 사운드 믹싱 추가하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 오디오 재생
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 15-18, 21)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 15, 19

  **References**:
  - Task 19에서 준비한 사운드 파일 사용
  - Howler.js: https://howlerjs.com/

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/sound.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - 사운드 파일 로드 성공
  # - 사운드 on/off 설정 반영
  # - 각 이벤트 타입에 올바른 사운드 매핑
  ```

  **Commit**: YES
  - Message: `feat(sound): integrate sound effects`
  - Files: `src/renderer/sound.ts`, `src/__tests__/sound.test.ts`

---

- [ ] 21. 통계 저장/표시

  **What to do**:
  - electron-store 또는 localStorage 사용
  - 저장 항목: 총 게임 수, 승리 수, 총 획득 점수, 난이도별 전적
  - 통계 화면 UI
  - 게임 종료 시 자동 저장

  **Must NOT do**:
  - 클라우드 동기화 추가하지 말 것
  - 상세 리플레이 저장하지 말 것

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 저장/로드 로직
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 15-20)
  - **Blocks**: Task 22
  - **Blocked By**: Task 15

  **References**:
  - electron-store: https://github.com/sindresorhus/electron-store
  - 저장 구조:
    ```typescript
    interface Stats {
      totalGames: number;
      wins: number;
      totalScore: number;
      byDifficulty: {
        easy: { games: number; wins: number };
        medium: { games: number; wins: number };
        hard: { games: number; wins: number };
      };
    }
    ```

  **Acceptance Criteria**:
  ```bash
  npx vitest run src/__tests__/stats.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - saveStats(): 데이터 저장 성공
  # - loadStats(): 데이터 로드 성공
  # - updateStats(): 게임 결과 반영
  # - 앱 재시작 후 데이터 유지

  npx playwright test e2e/stats.test.ts
  # Expected: PASS
  # 테스트 항목:
  # - 통계 화면 존재
  # - 게임 후 통계 업데이트
  ```

  **Commit**: YES
  - Message: `feat(stats): implement statistics storage and display`
  - Files: `src/store/stats.ts`, `src/renderer/components/Stats.ts`, `src/__tests__/stats.test.ts`

---

### Wave 6: 통합 및 빌드

- [ ] 22. 게임 플로우 통합 테스트

  **What to do**:
  - 전체 게임 플로우 E2E 테스트
  - 시작 → 카드 배분 → 턴 진행 → 점수 계산 → 종료
  - 각 난이도 AI 대전 테스트
  - 에지 케이스 테스트 (쪽, 폭탄, 고 후 역전 등)

  **Must NOT do**:
  - 새 기능 추가하지 말 것 (테스트만)
  - 성능 최적화는 별도로

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 복잡한 통합 테스트
  - **Skills**: [`playwright`]
    - `playwright`: E2E 테스트 필수

  **Parallelization**:
  - **Can Run In Parallel**: NO (모든 UI 작업 완료 후)
  - **Parallel Group**: Wave 6 (단독)
  - **Blocks**: Task 23
  - **Blocked By**: Tasks 15-21

  **References**:
  - Playwright Electron 테스트: https://playwright.dev/docs/api/class-electron

  **Acceptance Criteria**:
  ```bash
  npx playwright test e2e/
  # Expected: 모든 E2E 테스트 PASS
  # 테스트 항목:
  # - 게임 시작 → 카드 배분 확인
  # - 카드 선택 → 매칭 → 획득 확인
  # - 7점 도달 → 고/스톱 선택 가능 확인
  # - 게임 종료 → 결과 화면 확인
  # - 통계 업데이트 확인
  # - 초급/중급/고급 AI 각각 한 판씩 완료

  npm test
  # Expected: 전체 테스트 PASS, 커버리지 80% 이상
  ```

  **Commit**: YES
  - Message: `test: add comprehensive E2E game flow tests`
  - Files: `e2e/**/*.test.ts`

---

- [ ] 23. Windows 빌드 및 패키징 (electron-builder 크로스 빌드)

  **What to do**:
  - electron-builder 설정 검증 (Task 1에서 설정한 `electron-builder.yml`)
  - 앱 아이콘 설정 (`build/icon.ico` - 256x256px ICO 파일)
  - **macOS에서 Windows NSIS installer 크로스 빌드 실행**:
    ```bash
    npm run dist:win
    # 내부 명령: electron-builder --win --x64
    ```
  - electron-builder는 macOS에서도 Windows NSIS installer 크로스 컴파일을 지원
    (Wine 없이도 가능 - NSIS는 크로스 플랫폼 빌드 지원)
  - 빌드 파일 크기 최적화 (불필요 파일 제외 - `electron-builder.yml`의 `files` 필드)
  - README에 설치 방법 문서화 (한국어)

  **Must NOT do**:
  - 코드 서명하지 말 것 (개인 사용)
  - 자동 업데이트 설정하지 말 것
  - macOS 빌드하지 말 것
  - Electron Forge 사용하지 말 것 (`maker-squirrel`는 Windows에서만 동작)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 빌드 명령 실행 및 검증
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (Task 22 완료 후)
  - **Parallel Group**: Wave 6 (마지막)
  - **Blocks**: None
  - **Blocked By**: Task 22

  **References**:
  - electron-builder NSIS target: https://www.electron.build/nsis
  - electron-builder 크로스 빌드: https://www.electron.build/multi-platform-build
  - macOS에서 Windows 빌드 시 Wine 불필요 (NSIS만 사용 시)
  - 앱 아이콘 생성: https://www.electron.build/icons (256x256px ICO)

  **Acceptance Criteria**:
  ```bash
  # Windows 빌드 실행 (macOS에서 크로스 빌드)
  npm run dist:win
  # Expected: 에러 없이 완료

  # 빌드 결과물 확인
  ls -la dist/
  # Expected: "고스톱 Setup x.x.x.exe" 파일 존재

  # 파일 크기 확인 (150MB 이하 권장)
  du -h dist/*.exe
  # Expected: < 150MB

  # README 존재 확인
  cat README.md | grep -i "설치"
  # Expected: 설치 방법 섹션 존재

  # 아이콘 파일 존재 확인
  file build/icon.ico
  # Expected: MS Windows icon resource 
  ```

  **Commit**: YES
  - Message: `chore: configure Windows build with electron-builder`
  - Files: `electron-builder.yml`, `README.md`, `package.json`, `build/icon.ico`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `chore: initialize Electron project with TypeScript and electron-builder` | package.json, tsconfig.json, webpack.config.js, electron-builder.yml, src/** | npm run build |
| 2 | `chore: setup Vitest test infrastructure` | vitest.config.ts, src/__tests__/example.test.ts, package.json | npm test |
| 3 | `feat(game): define Hwatu card types and constants` | src/game/cards.ts, src/__tests__/cards.test.ts | npm test |
| 4 | `feat(assets): add Hwatu card images from Wikimedia Commons` | src/assets/cards/**, ATTRIBUTION.md | ls src/assets/cards/ |
| 5 | `feat(game): implement deck creation and shuffle logic` | src/game/deck.ts, src/__tests__/deck.test.ts | npm test |
| 6 | `feat(game): implement game state management` | src/game/state.ts, src/__tests__/state.test.ts | npm test |
| 7 | `feat(game): implement card matching logic` | src/game/matching.ts, src/__tests__/matching.test.ts | npm test |
| 8 | `feat(game): implement special rules (jjok, ppuk, bomb, chongtong, shake)` | src/game/special-rules.ts, src/__tests__/special-rules.test.ts | npm test |
| 9 | `feat(game): implement scoring system` | src/game/scoring.ts, src/__tests__/scoring.test.ts | npm test |
| 10 | `feat(game): implement combo detection (godori, dan patterns)` | src/game/combos.ts, src/__tests__/combos.test.ts | npm test |
| 11 | `feat(game): implement go/stop selection logic` | src/game/go-stop.ts, src/__tests__/go-stop.test.ts | npm test |
| 12 | `feat(ai): implement easy difficulty AI (random selection)` | src/ai/easy.ts, src/__tests__/ai-easy.test.ts | npm test |
| 13 | `feat(ai): implement medium difficulty AI (heuristic-based)` | src/ai/medium.ts, src/__tests__/ai-medium.test.ts | npm test |
| 14 | `feat(ai): implement hard difficulty AI (expectation maximization)` | src/ai/hard.ts, src/__tests__/ai-hard.test.ts | npm test |
| 15 | `feat(ui): implement game board layout` | src/renderer/styles.css, src/renderer/index.html, src/renderer/App.ts | npm run start |
| 16 | `feat(ui): implement card display component` | src/renderer/components/Card.ts, src/renderer/components/Card.css | playwright test |
| 17 | `feat(ui): implement score and status display` | src/renderer/components/ScoreBoard.ts, src/renderer/components/Message.ts | playwright test |
| 18 | `feat(ui): implement game controls` | src/renderer/components/Controls.ts, src/renderer/components/Settings.ts | playwright test |
| 19 | `feat(assets): add sound effects` | src/assets/sounds/** | ls src/assets/sounds/ |
| 20 | `feat(sound): integrate sound effects` | src/renderer/sound.ts, src/__tests__/sound.test.ts | npm test |
| 21 | `feat(stats): implement statistics storage and display` | src/store/stats.ts, src/renderer/components/Stats.ts, src/__tests__/stats.test.ts | npm test |
| 22 | `test: add comprehensive E2E game flow tests` | e2e/**/*.test.ts | playwright test |
| 23 | `chore: configure Windows build with electron-builder` | electron-builder.yml, README.md, package.json, build/icon.ico | npm run dist:win |

---

## Success Criteria

### Verification Commands
```bash
# 전체 테스트 실행
npm test
# Expected: 모든 테스트 PASS

# 커버리지 확인
npm run test:coverage
# Expected: 커버리지 80% 이상

# E2E 테스트 실행
npx playwright test e2e/
# Expected: 모든 E2E 테스트 PASS

# Windows 빌드 (macOS에서 크로스 빌드)
npm run dist:win
# Expected: dist/ 에 .exe 파일 생성

# 앱 실행 (개발 모드)
npm run start
# Expected: Electron 창 열림, 게임 플레이 가능
```

### Final Checklist
- [ ] 모든 "Must Have" 기능 구현 완료
- [ ] 모든 "Must NOT Have" 항목 미포함 확인
- [ ] 전체 테스트 PASS (커버리지 80%+)
- [ ] Windows 설치 파일 생성 완료
- [ ] 게임 한 판 완료 가능 (시작~종료)
- [ ] AI 3단계 모두 동작
- [ ] 사운드 효과 동작
- [ ] 통계 저장/표시 동작
- [ ] 큰 글씨/카드 적용 (접근성)
