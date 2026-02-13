import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const CASINO_SOUND_PATHS = {
  'card-deal': 'assets/sounds/cards-pack-open-1.ogg',
  'card-place': 'assets/sounds/card-place-2.ogg',
  'card-match': 'assets/sounds/card-slide-4.ogg',
  'combo': 'assets/sounds/chips-collide-4.ogg',
  'go': 'assets/sounds/chip-lay-3.ogg',
  'stop': 'assets/sounds/chip-lay-1.ogg',
  'win': 'assets/sounds/chips-stack-6.ogg',
  'lose': 'assets/sounds/chips-handle-3.ogg',
} as const;

type AudioEventName = 'canplaythrough' | 'error';

class MockAudio {
  static instances: MockAudio[] = [];

  readonly src: string;
  volume = 1;
  currentTime = 1;
  readonly play = vi.fn(async () => undefined);
  readonly pause = vi.fn(() => undefined);

  constructor(src: string) {
    this.src = src;
    MockAudio.instances.push(this);
  }

  addEventListener(event: AudioEventName, listener: () => void): void {
    if (event === 'canplaythrough') {
      listener();
    }
  }
}

describe('sound', () => {
  const originalAudio = globalThis.Audio;

  beforeEach(() => {
    MockAudio.instances = [];
    vi.resetModules();
    globalThis.Audio = MockAudio as unknown as typeof Audio;
  });

  afterEach(() => {
    globalThis.Audio = originalAudio;
  });

  it('plays card-deal using casino sound path', async () => {
    const { playSound } = await import('../renderer/sound');

    playSound('card-deal');

    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].src).toBe(CASINO_SOUND_PATHS['card-deal']);
    expect(MockAudio.instances[0].currentTime).toBe(0);
    expect(MockAudio.instances[0].play).toHaveBeenCalledTimes(1);
  });

  it('preloads all casino sounds', async () => {
    const { preloadSounds } = await import('../renderer/sound');

    await preloadSounds();

    expect(MockAudio.instances).toHaveLength(Object.keys(CASINO_SOUND_PATHS).length);
    const loadedSources = MockAudio.instances.map((instance) => instance.src);

    for (const source of Object.values(CASINO_SOUND_PATHS)) {
      expect(loadedSources).toContain(source);
    }
  });

  it('updates volume and stops cached sounds', async () => {
    const { playSound, setVolume, stopAllSounds } = await import('../renderer/sound');

    playSound('card-place');
    playSound('go');

    setVolume(0.35);
    stopAllSounds();

    for (const audio of MockAudio.instances) {
      expect(audio.volume).toBe(0.35);
      expect(audio.pause).toHaveBeenCalledTimes(1);
      expect(audio.currentTime).toBe(0);
    }
  });
});
