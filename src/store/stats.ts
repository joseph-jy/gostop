export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  highScore: number;
}

const STORAGE_KEY = 'gostop-stats';

function getDefaultStats(): GameStats {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    highScore: 0,
  };
}

function validateStats(data: unknown): data is GameStats {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const stats = data as Record<string, unknown>;

  return (
    typeof stats.totalGames === 'number' &&
    typeof stats.wins === 'number' &&
    typeof stats.losses === 'number' &&
    typeof stats.highScore === 'number' &&
    stats.totalGames >= 0 &&
    stats.wins >= 0 &&
    stats.losses >= 0 &&
    stats.highScore >= 0
  );
}

export function loadStats(): GameStats {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);

    if (serialized === null) {
      return getDefaultStats();
    }

    const parsed = JSON.parse(serialized);

    if (validateStats(parsed)) {
      return parsed;
    }

    return getDefaultStats();
  } catch (error) {
    console.error('Failed to load stats:', error);
    return getDefaultStats();
  }
}

export function saveStats(stats: GameStats): void {
  try {
    const serialized = JSON.stringify(stats);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

export function recordGame(won: boolean, score: number): GameStats {
  const currentStats = loadStats();
  const newStats: GameStats = {
    totalGames: currentStats.totalGames + 1,
    wins: won ? currentStats.wins + 1 : currentStats.wins,
    losses: won ? currentStats.losses : currentStats.losses + 1,
    highScore: Math.max(currentStats.highScore, score),
  };

  saveStats(newStats);

  return newStats;
}

export function resetStats(): void {
  saveStats(getDefaultStats());
}
