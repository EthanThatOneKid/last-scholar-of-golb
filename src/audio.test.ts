import { describe, expect, it } from "vitest";
import { type AudioContextLike, createAudioManager } from "./audio";

interface FakeSource {
  buffer: unknown;
  loop: boolean;
  started: boolean;
  stopped: boolean;
}

function fakeContext() {
  const sources: FakeSource[] = [];
  const gains: { gain: { value: number } }[] = [];
  const log: string[] = [];
  const ctx = {
    currentTime: 0,
    state: "suspended",
    destination: {},
    createGain() {
      const g = { gain: { value: 1 }, connect() {} };
      gains.push(g);
      return g;
    },
    createBufferSource() {
      const s = {
        buffer: null as unknown,
        loop: false,
        started: false,
        stopped: false,
        connect() {},
        start() {
          s.started = true;
        },
        stop() {
          s.stopped = true;
        },
      };
      sources.push(s);
      return s;
    },
    async decodeAudioData(data: ArrayBuffer) {
      return { decoded: data.byteLength };
    },
    async resume() {
      log.push("resume");
      ctx.state = "running";
    },
    async suspend() {
      log.push("suspend");
      ctx.state = "suspended";
    },
  };
  return { ctx: ctx as AudioContextLike & { currentTime: number; state: string }, sources, gains, log };
}

const bytes = async () => new ArrayBuffer(8);

function setup(fetchBytes: (url: string) => Promise<ArrayBuffer> = bytes) {
  const f = fakeContext();
  const audio = createAudioManager({ createContext: () => f.ctx, fetchBytes });
  return { ...f, audio };
}

describe("audio manager", () => {
  it("is locked, silent and at time 0 until unlock", async () => {
    const { audio, sources } = setup();
    expect(audio.unlocked).toBe(false);
    expect(audio.time).toBe(0);
    await audio.load("beep", "/beep.ogg");
    audio.playSfx("beep");
    expect(sources).toHaveLength(0);
  });

  it("unlock creates and resumes the context, then decodes what was loaded earlier", async () => {
    const { audio, ctx, sources, log } = setup();
    await audio.load("beep", "/beep.ogg");
    audio.unlock();
    expect(audio.unlocked).toBe(true);
    expect(log).toContain("resume");
    await new Promise((r) => setTimeout(r, 0));
    audio.playSfx("beep");
    expect(sources).toHaveLength(1);
    expect(sources[0].started).toBe(true);
    expect(sources[0].loop).toBe(false);
    ctx.currentTime = 2.5;
    expect(audio.time).toBe(2.5);
  });

  it("a file that fails to load stays silent and reports false", async () => {
    const { audio, sources } = setup(async () => {
      throw new Error("404");
    });
    audio.unlock();
    expect(await audio.load("nope", "/nope.ogg")).toBe(false);
    audio.playSfx("nope");
    audio.playMusic("nope");
    expect(sources).toHaveLength(0);
  });

  it("playing an unknown name is a no-op", () => {
    const { audio, sources } = setup();
    audio.unlock();
    audio.playSfx("never-loaded");
    expect(sources).toHaveLength(0);
  });

  it("mute and volume drive the master gain", () => {
    const { audio, gains } = setup();
    audio.unlock();
    const master = gains[0];
    audio.setVolume(0.5);
    expect(master.gain.value).toBe(0.5);
    expect(audio.toggleMute()).toBe(true);
    expect(master.gain.value).toBe(0);
    expect(audio.toggleMute()).toBe(false);
    expect(master.gain.value).toBe(0.5);
    audio.setVolume(7);
    expect(audio.volume).toBe(1);
    audio.setVolume(Number.NaN);
    expect(audio.volume).toBe(0);
  });

  it("mute set before unlock applies once unlocked", () => {
    const { audio, gains } = setup();
    audio.setMuted(true);
    audio.unlock();
    expect(gains[0].gain.value).toBe(0);
  });

  it("pause suspends the clock and resume restarts it", () => {
    const { audio, log } = setup();
    audio.unlock();
    audio.pause();
    expect(audio.paused).toBe(true);
    expect(log.at(-1)).toBe("suspend");
    audio.resume();
    expect(audio.paused).toBe(false);
    expect(log.at(-1)).toBe("resume");
  });

  it("unlocking while paused leaves the context suspended", () => {
    const { audio, ctx } = setup();
    audio.pause();
    audio.unlock();
    expect(ctx.state).toBe("suspended");
  });

  it("music loops by default and starting a new track stops the old one", async () => {
    const { audio, sources } = setup();
    audio.unlock();
    await audio.load("a", "/a.ogg");
    await audio.load("b", "/b.ogg");
    audio.playMusic("a");
    expect(sources[0].loop).toBe(true);
    audio.playMusic("b");
    expect(sources[0].stopped).toBe(true);
    expect(sources[1].stopped).toBe(false);
    audio.stopMusic();
    expect(sources[1].stopped).toBe(true);
  });

  it("survives a browser with no Web Audio", () => {
    const audio = createAudioManager({
      createContext: () => {
        throw new Error("unsupported");
      },
    });
    expect(() => audio.unlock()).not.toThrow();
    expect(audio.unlocked).toBe(false);
    expect(() => audio.playSfx("x")).not.toThrow();
  });
});
