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

