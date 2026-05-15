export type WheelAudio = {
  ensure: () => boolean;
  tick: () => void;
  ding: () => void;
  clack: () => void;
};

export function makeAudio(): WheelAudio {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;

  const ensure = (): boolean => {
    if (!ctx) {
      try {
        const windowWithWebkit = window as Window &
          typeof globalThis & {
          webkitAudioContext?: typeof AudioContext;
        };
        const AudioContextCtor =
          windowWithWebkit.AudioContext || windowWithWebkit.webkitAudioContext;
        if (!AudioContextCtor) return false;
        const audioCtx = new AudioContextCtor();
        ctx = audioCtx;
        master = audioCtx.createGain();
        master.gain.value = 0.4;
        master.connect(audioCtx.destination);
      } catch {
        return false;
      }
    }

    if (ctx && ctx.state === "suspended") {
      void ctx.resume();
    }
    return true;
  };

  const tick = (): void => {
    if (!ensure() || !ctx || !master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.05);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.08);
  };

  const ding = (): void => {
    if (!ensure() || !ctx || !master) return;
    const t = ctx.currentTime;
    for (const [index, frequency] of [880, 1320, 1760].entries()) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, t + index * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.3, t + index * 0.03 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.03 + 1.2);
      osc.connect(gain).connect(master);
      osc.start(t + index * 0.03);
      osc.stop(t + index * 0.03 + 1.3);
    }
  };

  const clack = (): void => {
    if (!ensure() || !ctx || !master) return;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i += 1) {
      channelData[i] = (Math.random() * 2 - 1) * (1 - i / channelData.length) ** 2;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    source.connect(gain).connect(master);
    source.start();
  };

  return { ensure, tick, ding, clack };
}
