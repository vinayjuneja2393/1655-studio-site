"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import s from "./site.module.css";

const MARKS = [1, 2, 3, 4, 5].map((n) => `/intro/mark-${n}.svg`);

/** Cycles the five wordmark frames, with a short slice-and-split glitch on every swap. */
export function GlitchMark({ duration }: { duration: number }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const step = duration / MARKS.length;
    const timers = MARKS.slice(1).map((_, k) => setTimeout(() => setI(k + 1), (k + 1) * step * 1000));
    return () => timers.forEach(clearTimeout);
  }, [duration]);

  return (
    <div className={s.mark} aria-hidden="true">
      {/* Every frame stays mounted so all five are fetched up front and swaps never wait on the network. */}
      {MARKS.map((src, k) => (
        <img key={src} src={src} alt="" className={s.markFrame} style={{ opacity: k === i ? 1 : 0 }} />
      ))}
      <div key={i} className={s.markGlitch}>
        <img src={MARKS[i]} alt="" className={s.markGhostA} />
        <img src={MARKS[i]} alt="" className={s.markGhostB} />
        <img src={MARKS[i]} alt="" className={s.markSlice} />
      </div>
    </div>
  );
}

const AUDIENCE = ["Creators", "Coaches", "Consultants"];

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
