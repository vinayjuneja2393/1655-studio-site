"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import s from "./site.module.css";

// 4x4 Bayer matrix, normalised to 0..1
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const PINK: [number, number, number] = [251, 40, 116];
const WHITE: [number, number, number] = [255, 255, 255];
const CELL = 3; // css px per dither cell

// Glitch bursts: [start, length] in seconds. The last one is the exit hit.
const BURSTS: [number, number][] = [
  [0.28, 0.09],
  [0.62, 0.06],
  [0.95, 0.12],
  [1.32, 0.07],
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

function makeCanvas(w: number, h = w) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * The fox builds up out of 1-bit pink dither, takes a few glitch hits
 * (slice offsets, colour split, scanlines), then resolves to the crisp mark.
 */
export function GlitchFox({ duration }: { duration: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const css = canvas.clientWidth || 280;
    const W = Math.round(css * dpr);
    canvas.width = W;
    canvas.height = W;

    const N = Math.ceil(css / CELL);
    const small = makeCanvas(N);
    const sctx = small.getContext("2d", { willReadFrequently: true })!;
    const dith = makeCanvas(N);
    const dctx = dith.getContext("2d")!;
    const out = dctx.createImageData(N, N);
    const comp = makeCanvas(W);
    const cctx = comp.getContext("2d")!;
    const tint = makeCanvas(W);
    const tctx = tint.getContext("2d")!;

    // A few grain tiles to cycle through
    const grain = Array.from({ length: 4 }, () => {
      const c = makeCanvas(160);
      const x = c.getContext("2d")!;
      const d = x.createImageData(160, 160);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      return c;
    });

    let lum: Float32Array | null = null;
    let alpha: Float32Array | null = null;
    let raf = 0;
    let start = 0;
    let frameNo = 0;

    const img = new Image();
    img.decoding = "async";
    img.src = "/fox.png";

    const glitchAmount = (t: number) => {
      for (const [b, len] of BURSTS) if (t >= b && t < b + len) return 0.6 + Math.random() * 0.4;
      if (t > duration - 0.22) return 1; // final hit
      return Math.random() < 0.03 ? 0.25 : 0; // stray flickers
    };

    const tinted = (rgb: [number, number, number]) => {
      tctx.globalCompositeOperation = "source-over";
      tctx.clearRect(0, 0, W, W);
      tctx.drawImage(comp, 0, 0);
      tctx.globalCompositeOperation = "source-in";
      tctx.fillStyle = `rgb(${rgb.join(",")})`;
      tctx.fillRect(0, 0, W, W);
      return tint;
    };

    const draw = (now: number) => {
      if (!start) start = now;
      const t = (now - start) / 1000;
      const p = clamp(t / duration);
      frameNo++;

      // 1) Dither reveal: density grows over the first ~65%
      const r = easeOut(clamp(p / 0.65));
      const jitter = frameNo % 2;
      if (lum && alpha) {
        const o = out.data;
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const i = y * N + x;
            const k = i * 4;
            const a = alpha[i];
            const l = lum[i];
            const density = r * (0.5 + 0.5 * (1 - l)) + (l > 0.78 ? r * 0.35 : 0);
            const th = BAYER[((y + jitter) & 3) * 4 + ((x + jitter) & 3)];
            if (a > 0.45 && th < density) {
              const c = l > 0.78 ? WHITE : PINK;
              o[k] = c[0];
              o[k + 1] = c[1];
              o[k + 2] = c[2];
              o[k + 3] = 255;
            } else {
              o[k + 3] = 0;
            }
          }
        }
        dctx.putImageData(out, 0, 0);
      }

      // 2) Composite: dither, crossfading into the crisp mark
      const full = easeOut(clamp((p - 0.55) / 0.3));
      cctx.globalCompositeOperation = "source-over";
      cctx.clearRect(0, 0, W, W);
      cctx.imageSmoothingEnabled = false;
      cctx.globalAlpha = 1 - full * 0.85;
      cctx.drawImage(dith, 0, 0, W, W);
      cctx.imageSmoothingEnabled = true;
      cctx.imageSmoothingQuality = "high";
      cctx.globalAlpha = full;
      if (img.complete) cctx.drawImage(img, 0, 0, W, W);
      cctx.globalAlpha = 1;

      // 3) Grain, only on the mark
      cctx.globalCompositeOperation = "source-atop";
      cctx.globalAlpha = 0.22 - full * 0.1;
      const g = grain[frameNo % grain.length];
      const gs = 160 * dpr;
      for (let y = 0; y < W; y += gs) for (let x = 0; x < W; x += gs) cctx.drawImage(g, x, y, gs, gs);
      cctx.globalAlpha = 1;
      cctx.globalCompositeOperation = "source-over";

      // 4) Output, with glitch when a burst is on
      ctx.clearRect(0, 0, W, W);
      const gl = glitchAmount(t);
      if (gl > 0) {
        const split = (4 + gl * 14) * dpr;
        ctx.globalAlpha = 0.85;
        ctx.drawImage(tinted([240, 138, 36]), -split, 0);
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(tinted([60, 220, 255]), split * 0.7, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;

        // Slices shifted sideways
        let y = 0;
        while (y < W) {
          const h = (6 + Math.random() * 38) * dpr;
          const shift = Math.random() < 0.55 ? (Math.random() - 0.5) * 2 * gl * 36 * dpr : 0;
          ctx.drawImage(comp, 0, y, W, h, shift, y, W, h);
          y += h;
        }

        // Scanlines
        ctx.fillStyle = "rgba(10,10,10,0.35)";
        for (let sy = 0; sy < W; sy += 3 * dpr) ctx.fillRect(0, sy, W, dpr);
      } else {
        ctx.drawImage(comp, 0, 0);
      }

      if (t < duration + 0.1) raf = requestAnimationFrame(draw);
    };

    img.onload = () => {
      sctx.clearRect(0, 0, N, N);
      sctx.drawImage(img, 0, 0, N, N);
      const d = sctx.getImageData(0, 0, N, N).data;
      lum = new Float32Array(N * N);
      alpha = new Float32Array(N * N);
      for (let i = 0; i < N * N; i++) {
        const k = i * 4;
        lum[i] = (0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) / 255;
        alpha[i] = d[k + 3] / 255;
      }
      raf = requestAnimationFrame(draw);
    };

    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return <canvas ref={ref} className={s.glitchCanvas} aria-hidden="true" />;
}

const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFX";
const WORD = "1655.STUDIO";

/** "1655.STUDIO" decodes left to right while a counter runs to 100. */
export function DecodeLabel({ duration }: { duration: number }) {
  const [text, setText] = useState(WORD.replace(/./g, " "));
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    const id = setInterval(() => {
      const p = clamp((performance.now() - t0) / 1000 / (duration * 0.85));
      const settled = Math.floor(p * WORD.length);
      setText(
        WORD.split("")
          .map((ch, i) => (i < settled ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      setPct(Math.round(p * 100));
      if (p >= 1) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [duration]);

  return (
    <div className={s.decode}>
      <span className={s.decodeWord}>{text}</span>
      <span className={s.decodePct}>{String(pct).padStart(3, "0")}%</span>
    </div>
  );
}

const AUDIENCE = ["Creators", "Coaches", "Consultants", "Podcasters", "Experts"];

/** "Built for" + each audience word, letters staggering in fast, one word after another. */
export function BuiltFor({ start, each }: { start: number; each: number }) {
  const [i, setI] = useState(-1);

  useEffect(() => {
    const timers = AUDIENCE.map((_, k) => setTimeout(() => setI(k), (start + k * each) * 1000));
    return () => timers.forEach(clearTimeout);
  }, [start, each]);

  return (
    <div className={s.builtFor}>
      <motion.span
        className={s.builtLabel}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: start - 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        Built for
      </motion.span>
      <span className={s.builtWordMask}>
        <AnimatePresence initial={false}>
          {i >= 0 && (
            <motion.span key={AUDIENCE[i]} className={s.builtWord} aria-label={AUDIENCE[i]}>
              {AUDIENCE[i].split("").map((ch, k) => (
                <motion.span
                  key={k}
                  className={s.builtChar}
                  initial={{ y: "105%" }}
                  animate={{ y: "0%", transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1], delay: 0.05 + k * 0.016 } }}
                  exit={{ y: "-105%", transition: { duration: 0.14, ease: [0.55, 0, 1, 0.45], delay: k * 0.006 } }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </div>
  );
}
