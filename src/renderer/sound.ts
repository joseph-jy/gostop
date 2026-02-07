export type GameEvent =
  | 'card-deal'
  | 'card-place'
  | 'card-match'
  | 'combo'
  | 'go'
  | 'stop'
  | 'win'
  | 'lose';

const SOUND_MAP: Record<GameEvent, string> = {
  'card-deal': '/assets/sounds/card-deal.mp3',
  'card-place': '/assets/sounds/card-place.mp3',
  'card-match': '/assets/sounds/card-match.mp3',
  'combo': '/assets/sounds/combo.mp3',
  'go': '/assets/sounds/go.mp3',
  'stop': '/assets/sounds/stop.mp3',
  'win': '/assets/sounds/win.mp3',
  'lose': '/assets/sounds/lose.mp3',
};

const audioCache: Map<GameEvent, HTMLAudioElement> = new Map();

function getAudioElement(event: GameEvent): HTMLAudioElement | null {
  const path = SOUND_MAP[event];
  if (!path) {
    console.warn(`No sound file mapped for event: ${event}`);
    return null;
  }

  let audio = audioCache.get(event);

  if (!audio) {
    try {
      audio = new Audio(path);
      audioCache.set(event, audio);
    } catch (error) {
      console.error(`Failed to load audio for event ${event}:`, error);
      return null;
    }
  }

  return audio;
}

export function playSound(event: GameEvent): void {
  const audio = getAudioElement(event);

  if (!audio) {
    return;
  }

  audio.currentTime = 0;

  audio.play().catch((error) => {
    console.warn(`Failed to play sound for event ${event}:`, error);
  });
}

export function preloadSounds(): Promise<void[]> {
  const promises: Promise<void>[] = [];

  for (const event of Object.keys(SOUND_MAP) as GameEvent[]) {
    const audio = getAudioElement(event);

    if (audio) {
      const promise = new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', (err) => reject(err), { once: true });
      });

      promises.push(promise);
    }
  }

  return Promise.all(promises);
}

export function setVolume(volume: number): void {
  const clampedVolume = Math.max(0, Math.min(1, volume));

  for (const audio of audioCache.values()) {
    audio.volume = clampedVolume;
  }
}

export function stopAllSounds(): void {
  for (const audio of audioCache.values()) {
    audio.pause();
    audio.currentTime = 0;
  }
}
