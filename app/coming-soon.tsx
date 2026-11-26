"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./coming-soon.module.css";

// Swap in the real Cal.com "Discovery Call" link when it's ready.
const CAL_URL = "https://cal.com/1655studio/discovery-call";

// Final height of each black curtain, as a share of the area under the header.
// 0 = fully drawn up. Column 3 keeps only a hairline (drawn separately).
const CURTAINS = [0, 0, 0, 0.06, 0.44, 1];

const EASE = [0.76, 0, 0.24, 1] as const;
const DURATION = 1.1;
const STAGGER = 0.14;
const TEXT_DELAY = DURATION + STAGGER * (CURTAINS.length - 1) - 0.2;

export default function ComingSoon() {
  const reduce = useReducedMotion();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>1655.studio</span>
      </header>

      <div className={styles.stage} aria-hidden="true">
        {CURTAINS.map((target, i) => (
          <div key={i} className={styles.column}>
            {i === 2 && (
              <motion.span
                className={styles.line}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: DURATION * 0.6 + STAGGER * i, duration: 0.3 }}
              />
            )}
            <motion.div
              className={styles.curtain}
              initial={reduce ? false : { scaleY: 1 }}
              animate={{ scaleY: target }}
              transition={{
                duration: DURATION,
                ease: EASE,
                delay: 0.25 + STAGGER * i,
              }}
            />
          </div>
        ))}
      </div>

      <motion.section
        className={styles.content}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: TEXT_DELAY, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className={styles.kicker}>New site in progress</p>
        <h1 className={styles.headline}>
          Stop losing buyers
          <br />
          between content
          <br />
          and the sale.
        </h1>
        <p className={styles.body}>
          1655 is a system studio for creators, coaches and consultants who
          already sell a named offer. The full site is coming soon. Until then,
          book a call.
        </p>
        <a
          className={styles.cta}
          href={CAL_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a call <span aria-hidden="true">↗</span>
        </a>
      </motion.section>
    </main>
  );
}
