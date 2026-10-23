// Web Audio wrapper: volume, mute, pause, one-shot sound effects, looping music, and a master
// clock. `time` is AudioContext.currentTime, which drifts neither with frame rate nor with
// requestAnimationFrame jitter, so the future rhythm layer should chart against it. It stops while
// the manager is paused, which freezes any music and charts together.
//
// Browsers keep audio locked until a user gesture, so call unlock() from a key or click handler.

/** The slice of AudioContext used here, so tests can pass a fake. */
export interface AudioContextLike {
  readonly currentTime: number;
  readonly state: string;
  readonly destination: unknown;
  createGain(): {
    gain: { value: number };
    connect(node: unknown): unknown;
  };
  createBufferSource(): {
    buffer: unknown;
    loop: boolean;
    connect(node: unknown): unknown;
    start(when?: number): void;
    stop(): void;
  };
  decodeAudioData(data: ArrayBuffer): Promise<unknown>;
  resume(): Promise<void>;
  suspend(): Promise<void>;
}

export interface AudioManagerOptions {
  createContext?: () => AudioContextLike;
  fetchBytes?: (url: string) => Promise<ArrayBuffer>;
}

export interface PlayOptions {
  volume?: number;
}

export interface MusicOptions extends PlayOptions {
  loop?: boolean;
}

export interface AudioManager {
  readonly unlocked: boolean;
  readonly muted: boolean;
  readonly paused: boolean;
  readonly volume: number;
  /** Seconds on the audio clock. 0 until unlocked; frozen while paused. */
  readonly time: number;
  /** Fetches a sound. Resolves false (and stays silent) if it can't be loaded. */
  load(name: string, url: string): Promise<boolean>;
  /** Creates and starts the audio context. Must be called from a user gesture. */
  unlock(): void;
  setVolume(v: number): void;
  setMuted(m: boolean): void;
  toggleMute(): boolean;
  pause(): void;
  resume(): void;
  playSfx(name: string, opts?: PlayOptions): void;
  /** Starts a track, replacing any current one. */
  playMusic(name: string, opts?: MusicOptions): void;
  stopMusic(): void;
}

function defaultCreateContext(): AudioContextLike {
  const w = window as unknown as {
    AudioContext?: new () => AudioContextLike;
    webkitAudioContext?: new () => AudioContextLike;
  };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio is not supported");
  return new Ctor();
}

async function defaultFetchBytes(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.arrayBuffer();
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));

export function createAudioManager(opts: AudioManagerOptions = {}): AudioManager {
  const createContext = opts.createContext ?? defaultCreateContext;
  const fetchBytes = opts.fetchBytes ?? defaultFetchBytes;

  let ctx: AudioContextLike | null = null;
  let master: ReturnType<AudioContextLike["createGain"]> | null = null;
  let volume = 0.8;
  let muted = false;
  let paused = false;
  let music: { stop(): void } | null = null;

  const raw = new Map<string, ArrayBuffer>();
  const decoded = new Map<string, unknown>();

  function applyGain(): void {
    if (master) master.gain.value = muted ? 0 : volume;
  }

  async function decodePending(): Promise<void> {
    if (!ctx) return;
    for (const [name, bytes] of [...raw]) {
      raw.delete(name);
      try {
        // decodeAudioData detaches the buffer, so hand it a copy.
        decoded.set(name, await ctx.decodeAudioData(bytes.slice(0)));
      } catch {
        // An undecodable file stays silent, like a missing one.
      }
    }
  }

  function start(name: string, o: MusicOptions, loop: boolean): { stop(): void } | null {
    const buffer = decoded.get(name);
    if (!ctx || !master || buffer === undefined) return null;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = clamp01(o.volume ?? 1);
    src.buffer = buffer;
    src.loop = loop;
    src.connect(gain);
    gain.connect(master);
    src.start();
    return src;
  }

  return {
    get unlocked() {
      return ctx !== null;
    },
    get muted() {
      return muted;
    },
    get paused() {
      return paused;
    },
    get volume() {
      return volume;
    },
    get time() {
      return ctx ? ctx.currentTime : 0;
    },
    async load(name, url) {
      try {
        raw.set(name, await fetchBytes(url));
      } catch {
        return false;
      }
      await decodePending();
      return true;
    },
    unlock() {
      if (ctx) return;
      try {
        ctx = createContext();
      } catch {
        return; // no Web Audio: the game runs silently
      }
      master = ctx.createGain();
      master.connect(ctx.destination);
      applyGain();
      if (paused) void ctx.suspend();
      else if (ctx.state === "suspended") void ctx.resume();
      void decodePending();
    },
    setVolume(v) {
      volume = clamp01(v);
      applyGain();
    },
    setMuted(m) {
      muted = m;
      applyGain();
    },
    toggleMute() {
      muted = !muted;
      applyGain();
      return muted;
    },
    pause() {
      paused = true;
      if (ctx) void ctx.suspend();
    },
    resume() {
      paused = false;
      if (ctx) void ctx.resume();
    },
    playSfx(name, o = {}) {
      start(name, o, false);
    },
    playMusic(name, o = {}) {
      const next = start(name, o, o.loop ?? true);
      if (!next) return;
      music?.stop();
      music = next;
    },
    stopMusic() {
      music?.stop();
      music = null;
    },
  };
}
