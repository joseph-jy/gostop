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
  'card-deal': 'assets/sounds/cards-pack-open-1.ogg',
  'card-place': 'assets/sounds/card-place-2.ogg',
  'card-match': 'assets/sounds/card-slide-4.ogg',
  'combo': 'assets/sounds/chips-collide-4.ogg',
  'go': 'assets/sounds/chip-lay-3.ogg',
  'stop': 'assets/sounds/chip-lay-1.ogg',
  'win': 'assets/sounds/chips-stack-6.ogg',
  'lose': 'assets/sounds/chips-handle-3.ogg',
};

const DEFAULT_VOLUME = 0.15;
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
      audio.volume = DEFAULT_VOLUME;
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
