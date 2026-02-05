# Architectural Decisions - Go-Stop Game Project

This file tracks key architectural and design decisions.

---

## Initial Decisions from Plan

**Build Tool**: electron-builder (NOT Electron Forge)
- Reason: macOS에서 Windows NSIS installer 크로스 빌드 지원
- Electron Forge의 maker-squirrel는 Windows에서만 동작

**Package Manager**: npm (NOT bun)
- Reason: Electron 생태계와 완벽 호환

**Test Framework**: Vitest (NOT Jest)
- Reason: Node.js 생태계 호환, 빠른 HMR 지원

**Target Platform**: Windows ONLY
- 아버지를 위한 Windows 데스크탑 전용 게임

---
