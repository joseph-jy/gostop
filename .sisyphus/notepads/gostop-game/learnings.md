# Learnings - Go-Stop Game Project

This file tracks conventions, patterns, and wisdom accumulated during the project.

---

## 2026-02-05: Electron Project Initialization

### Setup Decisions
- **Package Manager**: npm (NOT bun) - Electron ecosystem has better compatibility with npm
- **Build Tool**: electron-builder (NOT Electron Forge) - Supports macOS to Windows cross-build without Wine
- **Bundler**: Webpack with separate configs for main/renderer/preload processes
- **TypeScript**: Strict mode enabled with all strict flags for maximum type safety

### Configuration Gotchas
1. **TypeScript lib setting**: Must include both "ES2020" and "DOM" in lib array
   - "DOM" is required for renderer process (document, window APIs)
   - Without it, renderer.ts fails with "Cannot find name 'document'" error

2. **Webpack multi-config**: Export array of configs for main/preload/renderer
   - Each process needs separate target: 'electron-main', 'electron-preload', 'electron-renderer'
   - HtmlWebpackPlugin only needed for renderer config
   - node.__dirname and node.__filename must be set to false for main/preload

3. **electron-builder NSIS**: Windows installer configuration
   - oneClick: true for simplified installation
   - createDesktopShortcut: always for better UX
   - Icon files go in build/ directory (not src/)

### Directory Structure
```
src/
├── main/main.ts          # Main process (BrowserWindow creation)
├── renderer/             # Renderer process (UI)
│   ├── index.html
│   └── renderer.ts
├── preload/preload.ts    # Preload script (contextBridge)
├── game/                 # Game logic
├── ai/                   # AI implementation
├── store/                # State management
├── assets/
│   ├── cards/            # Hwatu card images
│   └── sounds/           # Sound effects
└── __tests__/            # Test files
```

### npm Scripts
- `npm run start`: Build with Webpack + launch Electron (development)
- `npm run build`: Webpack bundle only (TypeScript → JavaScript)
- `npm run dist`: Build + create installer with electron-builder
- `npm run dist:win`: Explicit Windows target build

### Verification Commands
```bash
npx tsc --noEmit          # TypeScript type checking
npm run build             # Webpack bundling
npm run start             # Electron launch
npx electron-builder --help  # Confirm builder installed
```

### Dependencies Installed
- electron: ^40.1.0
- typescript: ^5.9.3
- electron-builder: ^26.7.0
- webpack: ^5.105.0
- webpack-cli: ^6.0.1
- ts-loader: ^9.5.4
- html-webpack-plugin: ^5.6.6


## 2026-02-05: Vitest Test Infrastructure Setup

### Setup Decisions
- **Test Framework**: Vitest ^4.0.18 (NOT Jest) - Faster, better TypeScript support, HMR-friendly
- **Coverage Provider**: v8 (built-in to Node.js, no extra dependencies needed)
- **Test Directory**: src/__tests__/ (already existed with .gitkeep)

### Configuration Details
- **vitest.config.ts**: Minimal config with coverage settings
  - Test pattern: `src/__tests__/**/*.test.ts`
  - Coverage reporters: text (terminal) + html (coverage/ directory)
  - Coverage includes: src/game/**, src/ai/**, src/store/** (game logic focus)

### npm Scripts Added
```json
"test": "vitest run",           # Single run (CI mode)
"test:watch": "vitest",         # Watch mode (development)
"test:coverage": "vitest run --coverage"  # Coverage report
```

### Installation Gotchas
1. **Coverage provider dependency**: `npm install -D vitest` alone is NOT enough
   - Must also install: `npm install -D @vitest/coverage-v8`
   - Without it, `npm run test:coverage` fails with "MISSING DEPENDENCY" error
   - v8 provider is built into Node.js but Vitest needs the adapter package

2. **package.json auto-update**: npm install updates package.json scripts
   - Must re-read package.json after npm install before editing
   - File modification timestamp changes, causing edit conflicts

### Verification Commands
```bash
npm test                                    # Run tests once
npx vitest run src/__tests__/example.test.ts  # Run specific test
npm run test:watch                          # Watch mode
npm run test:coverage                       # Generate coverage report
```

### Coverage Report Output
- Terminal: Text summary showing coverage % for each directory
- HTML: Generated in coverage/ directory with detailed reports
- Directories tracked: src/game/, src/ai/, src/store/ (as configured)

### Dependencies Installed
- vitest: ^4.0.18
- @vitest/coverage-v8: ^4.0.18

### Example Test Pattern
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### Next Steps for TDD
- All future tasks will follow: RED (test) → GREEN (implementation) → REFACTOR
- Test files go in src/__tests__/ with .test.ts suffix
- Coverage goal: 80%+ for game logic (src/game/**, src/ai/**, src/store/**)
- Use `npm run test:watch` during development for instant feedback


## 2026-02-05: Hwatu Card Types & Constants Definition

### TDD Workflow Execution
- **RED phase**: Wrote comprehensive test suite first (14 tests covering all card validation rules)
- **GREEN phase**: Implemented cards.ts with Month enum, CardType enum, Card interface, and 48-card CARDS constant
- **Verification**: All tests pass, TypeScript compilation clean, npm test passes

### Card Structure Decisions
1. **Month Enum**: Numeric enum (1-12) for direct month representation
   - Gotcha: `Object.values(Month)` returns both keys AND values (24 items)
   - Solution: Filter with `typeof v === 'number'` to get only numeric values
   
2. **CardType Enum**: String enum ('gwang', 'yeol', 'tti', 'pi') for clarity
   - Easier to debug and serialize than numeric values
   - Matches Korean card terminology

3. **Card Interface**: Simple structure with id, month, type, imagePath
   - id: Unique identifier (e.g., 'january-gwang', 'november-pi-double')
   - imagePath: Follows pattern 'cards/{name}.png' for asset loading

### Hwatu Card Distribution (48 total)
- **Gwang (광)**: 5 cards - January, March, August, November, December
- **Yeol (열끗)**: 9 cards - February, April, May, June, July, August, September, October, December
- **Tti (띠)**: 10 cards - Distributed as: 홍단 3장(1,2,3월), 청단 3장(6,9,10월), 초단 3장(4,5,7월), 비띠 1장(11월)
- **Pi (피)**: 24 cards - All remaining slots + 쌍피 2장(11,12월)

### Test Suite Patterns
- **Distribution validation**: Count by type and verify exact numbers
- **Month validation**: Ensure each month has exactly 4 cards
- **Uniqueness check**: All 48 card IDs must be unique
- **Enum validation**: Filter numeric enum values correctly
- **Sorting gotcha**: Use `sort((a, b) => a - b)` for numeric enums, not default string sort

### Key Learnings
1. **Numeric enum sorting**: Default sort() treats numbers as strings, causing wrong order
   - Example: [1, 11, 12, 3, 8] instead of [1, 3, 8, 11, 12]
   - Always use comparator function for numeric values

2. **Card ID naming**: Use descriptive IDs for debugging
   - Format: `{month}-{type}` or `{month}-{type}-{number}` for duplicates
   - Special cases: `november-pi-double`, `december-pi-double` for 쌍피

3. **October card fix**: October has 3 Pi cards (not Tti) to balance distribution
   - This ensures exactly 10 Tti cards and 24 Pi cards across all months

### Verification Results
```bash
✓ 48 total cards
✓ 4 cards per month (12 months)
✓ 5 Gwang cards in correct months
✓ 9 Yeol cards in correct months
✓ 10 Tti cards distributed correctly
✓ 24 Pi cards
✓ All card IDs unique
✓ All image paths valid
✓ TypeScript compilation: PASS
✓ npm test: 17 tests PASS
```

### Files Created
- `src/game/cards.ts`: 103 lines (enums, interface, 48-card constant)
- `src/__tests__/cards.test.ts`: 135 lines (14 comprehensive tests)

### Commit
- Message: `feat(game): define Hwatu card types and constants`
- Hash: 33e0727
- Files: 2 changed, 238 insertions


## Sound Effects Implementation (2026-02-05)

### Approach
- Created 8 game sound effects using FFmpeg sine wave synthesis
- All sounds are original synthetic audio, not downloaded from external sources
- This avoids licensing complexity and ensures full control over audio

### Sound Design
- **card-deal.mp3**: 200Hz sine wave (0.3s) - low frequency shuffle
- **card-place.mp3**: 800Hz sine wave (0.15s) - mid frequency click
- **card-match.mp3**: 1200Hz sine wave (0.2s) - higher frequency ding
- **combo.mp3**: Ascending tones (1000→1200→1400Hz) - success chime
- **go.mp3**: 1600Hz sine wave (0.25s) - clear bell tone
- **stop.mp3**: 600Hz sine wave (0.25s) - lower bell tone
- **win.mp3**: Ascending fanfare (1400→1600→1800Hz) - victory sound
- **lose.mp3**: Descending tones (1000→800→600Hz) - defeat sound

### Technical Details
- Format: MP3 (MPEG ADTS, layer III)
- Bitrate: 56 kbps
- Sample rate: 44.1 kHz
- Channels: Monaural
- File size: ~2-4KB each (very efficient)

### Tools Used
- FFmpeg with aevalsrc filter for sine wave generation
- libmp3lame encoder for MP3 compression

### Advantages
- No external dependencies or API keys needed
- Full control over sound characteristics
- Consistent, predictable audio quality
- Minimal file sizes
- No licensing concerns
- Easy to modify/regenerate if needed

### Directory Structure
```
src/assets/sounds/
├── card-deal.mp3
├── card-place.mp3
├── card-match.mp3
├── combo.mp3
├── go.mp3
├── stop.mp3
├── win.mp3
└── lose.mp3
```

### Attribution
Created ATTRIBUTION.md documenting all sound sources and licenses.

## Image Processing (Task 2)

### Wikimedia Commons Download
- Used Wikimedia Commons API to get direct SVG file URLs
- API endpoint: `https://commons.wikimedia.org/w/api.php?action=query&titles=File:FILENAME&prop=imageinfo&iiprop=url&format=json`
- Downloaded 12 monthly Hwatu SVG files (Hwatu001.svg through Hwatu012.svg)
- Each monthly file contains 4 cards in horizontal layout

### ImageMagick SVG to PNG Conversion
- Command: `convert input.svg -crop 4x1@ +repage -resize 150x225^ output_%d.png`
- `-crop 4x1@` splits image into 4 equal horizontal sections
- `+repage` resets virtual canvas after crop
- `-resize 150x225^` ensures minimum dimensions (^ flag = fill, not fit)
- `%d` in output filename creates numbered sequence (0, 1, 2, 3)
- Warning about deprecated `convert` command (use `magick` in future)
- Freetype warnings are non-critical and don't affect output

### Card Naming Convention
- Format: `{month}-{type}.png` (e.g., "january-gwang.png")
- Multiple cards of same type: `{month}-{type}-{number}.png` (e.g., "january-pi-1.png")
- Card types: gwang (광), bird (열끗), animal (열끗), hongdan (홍단), cheongdan (청단), chodan (초단), pi (피)
- November has 3 pi cards (pi-1, pi-2, pi-3) instead of 4 total cards

### Card Back Design
- Created simple geometric pattern using ImageMagick
- Command: `convert -size 150x225 xc:'#8B4513' -fill '#D2691E' -draw "rectangle 10,10 140,215" -fill '#A0522D' -draw "rectangle 20,20 130,205" card-back.png`
- Brown color scheme to match traditional card aesthetic

### Attribution Requirements
- CC BY-SA 4.0 license requires attribution
- Must credit author (Marcus Richert) and source (Wikimedia Commons)
- Must include license URL and terms
- Modifications (SVG→PNG, resizing) must be documented


## 2026-02-05: Deck Creation and Shuffle Logic (Task 5)

### TDD Workflow Execution
- **RED phase**: Wrote 23 comprehensive tests covering all deck operations
- **GREEN phase**: Implemented deck.ts with createDeck(), shuffle(), and dealCards() functions
- **Verification**: All 40 tests pass (23 new + 17 existing), TypeScript clean, npm test passes

### Deck Functions Implemented

1. **createDeck()**: Returns fresh copy of CARDS constant
   - Returns: Card[] (48 cards)
   - Immutability: Creates new array reference, original CARDS unchanged
   - Use case: Initialize game deck

2. **shuffle(deck: Card[])**: Fisher-Yates shuffle algorithm
   - Returns: New shuffled Card[] array
   - Immutability: Original deck parameter never modified
   - Algorithm: Copy array, then swap random elements from end to start
   - Randomness: Uses Math.random() for true randomness (no fixed seed)

3. **dealCards(deck: Card[])**: Distributes cards to players and field
   - Returns: DealResult interface with playerHand, aiHand, field, deck
   - Distribution: Player 10, AI 10, Field 8, Deck 20 (total 48)
   - Immutability: Input deck never modified, all outputs are new arrays
   - Process: Internally shuffles deck, then slices into distribution

### Fisher-Yates Algorithm Details
```typescript
function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];  // Copy for immutability
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}
```
- Time complexity: O(n)
- Space complexity: O(n) for the copy
- Unbiased: All permutations equally likely
- Modern variant (Durstenfeld): Swap from end backwards

### Test Coverage Strategy
- **createDeck tests**: 5 tests covering array length, reference independence, uniqueness, property preservation
- **shuffle tests**: 6 tests covering immutability, randomness, card integrity, reference independence
- **dealCards tests**: 8 tests covering distribution (10+10+8+20), uniqueness, immutability, array references
- **Integration tests**: 2 tests covering full workflow (create→shuffle→deal) and immutability chain
- **Total**: 23 tests, all passing

### Key Learnings

1. **Immutability Pattern**: All functions use array spread operator [...array]
   - Ensures original arrays never modified
   - Enables functional programming style
   - Makes testing easier (can verify original unchanged)

2. **Randomness Testing**: Multiple shuffle calls should produce different results
   - Test compares shuffled card ID sequences
   - Very unlikely to be identical (probability ≈ 1/48!)
   - Validates true randomness (not fixed seed)

3. **Array Slicing**: dealCards uses slice() for distribution
   - slice(0, 10): Player hand
   - slice(10, 20): AI hand
   - slice(20, 28): Field (8 cards)
   - slice(28, 48): Remaining deck (20 cards)
   - slice() returns new array (immutability preserved)

4. **TypeScript Unused Variable Warnings**:
   - Removed unused Card import (only used in type annotations)
   - Removed unused dealt variable (function called but result not used)
   - Kept necessary comments explaining probabilistic test behavior

### DealResult Interface
```typescript
export interface DealResult {
  playerHand: Card[];  // 10 cards
  aiHand: Card[];      // 10 cards
  field: Card[];       // 8 cards
  deck: Card[];        // 20 cards
}
```

### Verification Results
```bash
✓ 23 deck tests PASS
✓ 17 card tests PASS (existing)
✓ 3 example tests PASS (existing)
✓ Total: 40 tests PASS
✓ TypeScript compilation: PASS (no errors)
✓ npm test: All tests PASS
```

### Files Created
- `src/game/deck.ts`: 34 lines (3 functions + 1 interface)
- `src/__tests__/deck.test.ts`: 217 lines (23 comprehensive tests)

### Commit
- Message: `feat(game): implement deck creation and shuffle logic`
- Hash: a45fd72
- Files: 2 changed, 251 insertions

### Next Steps
- Task 6 (Game State Management) will use dealCards() to initialize game state
- Task 7 (Game Rules) will use shuffle() for card dealing during gameplay
- Deck functions are pure and ready for integration with game logic


## 2026-02-05: Game State Management with Turn-Based Phase System (Task 6)

### TDD Workflow Execution
- **RED phase**: Wrote 38 comprehensive tests covering all state management operations
- **GREEN phase**: Implemented state.ts with GameState interface, Phase type, and all state functions
- **Verification**: All 78 tests pass (38 new + 40 existing), TypeScript compilation clean

### State Architecture Decisions

1. **Phase Type**: Union type with 8 distinct phases
   ```typescript
   type Phase = 'waiting' | 'select-hand' | 'match-hand' | 'flip-deck' 
              | 'match-deck' | 'check-score' | 'go-stop' | 'end';
   ```
   - Represents turn sequence in Go-Stop game
   - Type-safe phase transitions (TypeScript enforces valid values)

2. **GameState Interface**: Single source of truth for all game data
   - Player/AI hands (10 cards each)
   - Field (8 cards) and deck (20 cards)
   - Capture piles (playerCapture, aiCapture)
   - Turn tracking (currentTurn: 'player' | 'ai')
   - Phase tracking (phase: Phase)
   - Temporary state (selectedCard, flippedCard)
   - Game metadata (goCount, shakingMultiplier, lastAction)

3. **Immutability Pattern**: All state updates return new objects
   - `updateState(state, updates)`: Shallow merge with spread operator
   - Never mutate arrays or objects in place
   - Enables time-travel debugging and undo/redo

### Turn Sequence Implementation

**Complete Turn Flow:**
```
waiting → select-hand → match-hand → flip-deck → match-deck → check-score
  ↓ (if score < 7)
  → switch turn → select-hand (opponent's turn)
  
  ↓ (if score >= 7)
  → go-stop → end (stop) OR select-hand (go, switch turn)
```

**Key Functions:**
- `advancePhase(state)`: Moves to next phase in sequence
- `switchTurn(state)`: Toggles player/ai, resets phase to select-hand
- `shouldEnterGoStopPhase(state)`: Checks if current player has 7+ points

### Scoring Logic (Simplified for State Management)

Implemented basic scoring to support go-stop phase logic:
- **3 Gwang**: 7 points (triggers go-stop)
- **4 Gwang**: 10 points
- **5 Gwang**: 15 points
- **5+ Yeol**: (count - 4) points
- **5+ Tti**: (count - 4) points
- **10+ Pi**: (count - 9) points

**Note**: This is a simplified scoring system. Full scoring rules (including special combinations like 홍단, 청단, 초단) will be implemented in Task 9 (Scoring System).

### Card Selection and Deck Flipping

1. **selectCard(state, card)**: Removes card from playerHand, sets selectedCard
   - Immutability: Creates new array without selected card
   - Used in select-hand phase

2. **flipDeckCard(state)**: Removes top card from deck, sets flippedCard
   - Immutability: Uses array destructuring `[first, ...rest]`
   - Used in flip-deck phase

### Test Coverage Strategy

**38 tests organized into 9 test suites:**
1. Phase Type (1 test): Validates 8 phase values
2. createInitialState (12 tests): All initial state properties
3. State Immutability (3 tests): Ensures no mutations
4. Turn Switching (4 tests): Player ↔ AI transitions
5. Phase Transitions (6 tests): All phase advances
6. Go-Stop Phase Logic (4 tests): 7+ point threshold
7. Card Selection (3 tests): Hand card removal
8. Deck Card Flipping (3 tests): Deck card removal
9. Full Turn Sequence (2 tests): Complete turn flow

### Key Learnings

1. **Union Types for State Machines**: TypeScript union types are perfect for phase systems
   - Compile-time validation of phase values
   - Autocomplete in IDEs
   - Prevents typos and invalid states

2. **Immutability with Spread Operator**: Simple and effective pattern
   ```typescript
   return { ...state, phase: 'select-hand' };  // Shallow copy
   return { ...state, playerHand: [...state.playerHand, card] };  // Deep copy arrays
   ```

3. **Phase Transition Map**: Record type for clean phase logic
   ```typescript
   const phaseTransitions: Record<Phase, Phase> = {
     'waiting': 'select-hand',
     'select-hand': 'match-hand',
     // ...
   };
   ```
   - Centralized transition logic
   - Easy to modify sequence
   - Type-safe (TypeScript ensures all phases covered)

4. **Conditional Phase Transitions**: check-score phase has branching logic
   - If score >= 7: go to go-stop phase
   - If score < 7: switch turn (skip go-stop)
   - Implemented with explicit if-else in advancePhase()

5. **Test Data Setup**: Creating test cards inline for scoring tests
   ```typescript
   const gwangCards: Card[] = [
     { id: 'january-gwang', month: Month.January, type: CardType.Gwang, imagePath: 'test.png' },
     // ...
   ];
   ```
   - Avoids dependency on real card data
   - Makes test intent explicit

6. **TypeScript Unused Import Warning**: Remove unused type imports
   - GameState interface was imported but only used in type annotations
   - TypeScript infers types from function signatures
   - Only import types when explicitly needed

### Verification Results

```bash
✓ 38 state tests PASS
✓ 23 deck tests PASS (existing)
✓ 14 card tests PASS (existing)
✓ 3 example tests PASS (existing)
✓ Total: 78 tests PASS
✓ TypeScript compilation: PASS (no errors)
✓ npm test: All tests PASS
```

### Files Created
- `src/game/state.ts`: 165 lines (types, interfaces, 9 functions)
- `src/__tests__/state.test.ts`: 535 lines (38 comprehensive tests)

### Next Steps
- Task 7 (Game Rules): Will use state functions for card matching logic
- Task 9 (Scoring System): Will extend calculateScore() with full rules
- Task 10 (Turn Logic): Will orchestrate phase transitions with game rules
- Task 11 (Go/Stop Decision): Will use shouldEnterGoStopPhase() for AI logic

### Dependencies
- Depends on: Task 3 (Card types), Task 5 (Deck functions)
- Blocks: Tasks 7, 9, 10, 11 (all game logic needs state management)

