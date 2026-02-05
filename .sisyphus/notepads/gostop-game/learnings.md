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
