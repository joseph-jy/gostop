# AGENTS.md for GoStop Project

This document provides guidelines and conventions for AI agents contributing to the GoStop project. Its purpose is to ensure consistent development, adherence to project standards, and efficient collaboration.

## 1. Project Overview

GoStop is an Electron + TypeScript desktop application for playing the traditional Korean Hwatu card game. It features a 2-player mode against AI with three difficulty levels.

## 2. Technology Stack

Agents should be proficient with and adhere to the following technologies and versions:

*   **Runtime**: Electron 40.1.0
*   **Language**: TypeScript 5.9.3 (strict mode is enforced)
*   **Build Tool**: Webpack 5.105.0
*   **Unit Testing**: Vitest 4.0.18
*   **E2E Testing**: Playwright 1.58.1
*   **Packaging**: electron-builder 26.7.0
*   **Package Manager**: npm (Node.js 18+)

## 3. Core Agent Mandates

*   **Adherence to Conventions**: Always prioritize existing project conventions (formatting, naming, architecture). Analyze surrounding code thoroughly before making changes.
*   **TypeScript Strictness**: Maintain `strict` TypeScript mode. Any new code or modifications must compile without errors under `strict` settings.
*   **Testing**: New features or bug fixes *must* include corresponding unit or E2E tests. All tests must pass before marking a task as complete.
*   **Immutability**: Favor immutable data structures and pure functions, especially within the `game/` and `ai/` logic, to ensure predictable state management.
*   **Modularity**: Keep modules focused on a single responsibility. Avoid tightly coupled components.
*   **Performance**: Be mindful of performance, especially in game logic and UI rendering.
*   **Security**: Never introduce code that exposes sensitive information (e.g., API keys, user data).
*   **Explain Critical Commands**: When executing shell commands that modify the file system or system state, always provide a brief explanation.

## 4. Development Environment & Essential Commands

Agents should be able to set up and interact with the project using the following commands:

*   **Install Dependencies**:
    ```bash
    npm install
    ```
*   **Development Mode (Run App)**:
    ```bash
    npm start
    ```
    (This compiles TypeScript and runs Electron with DevTools automatically.)
*   **Build Project (Webpack)**:
    ```bash
    npm run build
    ```
*   **Run Unit Tests**:
    ```bash
    npm test
    ```
*   **Run Unit Tests in Watch Mode**:
    ```bash
    npm run test:watch
    ```
*   **Generate Test Coverage Report**:
    ```bash
    npm run test:coverage
    ```
*   **Package for Windows (Installer)**:
    ```bash
    npm run dist:win
    ```

## 5. Project Structure (Key Directories)

Agents should familiarize themselves with the following directory structure:

*   `src/main/`: Electron main process logic (app lifecycle, window creation).
*   `src/preload/`: Secure bridge between main and renderer processes.
*   `src/renderer/`: UI layer, HTML templates, renderer entry point, and UI components.
    *   `src/renderer/components/`: Location for UI components (e.g., `Card.ts`, `ScoreBoard.ts`).
    *   `src/renderer/sound.ts`: Module for game sound integration.
*   `src/game/`: Core game logic, entirely separated from UI. Contains modules for cards, deck, state, matching, special rules, scoring, and combos.
*   `src/ai/`: AI implementations for different difficulty levels (easy, medium, hard).
*   `src/store/`: Modules for game statistics storage (currently in progress).
*   `src/assets/`: Game assets like card images and sound effects.
*   `src/__tests__/`: Unit tests for `game/`, `ai/`, etc.
*   `e2e/`: End-to-End tests using Playwright.

## 6. Coding Conventions & Style

*   **Language**: TypeScript (strict mode).
*   **Naming**:
    *   Variables and functions: `camelCase`
    *   Constants: `UPPER_SNAKE_CASE`
    *   Classes/Interfaces/Types: `PascalCase`
*   **Comments**: Add meaningful comments, especially for complex logic, to explain *why* something is done, not just *what*. Avoid superfluous comments.
*   **No Empty Catch Blocks**: Ensure error handling is always explicit.
*   **Indentation**: Use 2 spaces for indentation (check existing files for confirmation if needed, but this is typical for TypeScript projects).
*   **File Naming**: Use `kebab-case` for file names (e.g., `special-rules.ts`).
*   **Imports**: Organize imports consistently (e.g., third-party, then project modules, then relative imports).

## 7. Development Workflow for Agents

1.  **Understand Task**: Thoroughly review the task requirements and scope.
2.  **Investigate Codebase**: Use tools like `read_file`, `search_file_content`, and `glob` to understand existing code, conventions, and relevant areas.
3.  **Plan**: Develop a clear, concise plan of action. Use `write_todos` for complex tasks.
4.  **Implement**: Write code adhering to project standards.
5.  **Test**: Add or update tests as necessary. Ensure `npm test` passes.
6.  **Build**: Verify the project builds successfully using `npm run build`.
7.  **Lint/Type Check**: Ensure no linting or TypeScript errors are introduced.
8.  **Verify E2E (if applicable)**: Run `e2e` tests if the change impacts the UI or user flow.
9.  **Propose Changes**: Clearly present the implemented changes.

## 8. Testing Guidelines

*   **Unit Tests**: Located in `src/__tests__/`. Focus on individual functions, classes, and pure game logic (`game/`, `ai/`).
    *   Write tests using the GIVEN-WHEN-THEN pattern.
    *   Cover edge cases.
*   **E2E Tests**: Located in `e2e/`. Focus on end-to-end game flows and UI interactions.
    *   Use Playwright.
    *   Avoid automating UI for the sake of it; prioritize game flow validation.
*   **Coverage**: Strive for high test coverage, especially for core game logic.

## 9. Contribution Areas (Current Focus)

Agents are currently encouraged to focus on:

1.  **UI Component Development**: Implement missing components in `src/renderer/components/` (e.g., `Card.ts`, `ScoreBoard.ts`, `Controls.ts`, `Stats.ts`).
2.  **Sound Integration**: Implement `src/renderer/sound.ts` to map game events to sound effects.
3.  **Statistics System**: Implement game statistics saving and loading in `src/store/stats.ts`.
4.  **E2E Test Expansion**: Write new Playwright tests in `e2e/` to cover more game scenarios.

## 10. Boundaries

*   **Do not modify**:
    *   `.git/` directory.
    *   `node_modules/` directory.
    *   Sensitive configuration files unless explicitly instructed and reviewed for security.
    *   Pre-built assets (images, sounds) unless specifically tasked with asset management.
*   **Strictly follow existing patterns**: Do not introduce new frameworks or libraries without explicit instruction and discussion.

This `AGENTS.md` is a living document. Agents should flag any ambiguities or suggest improvements.