"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { CAL_URL, EMAIL, X_HANDLE, X_URL } from "./links";
import s from "./site.module.css";

const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;
const OUT_EASE = [0.22, 1, 0.36, 1] as const;
const COLS = 6;
const INTRO_DONE = 2.0; // seconds until the last curtain has cleared

/* ---------- Intro: two layers of curtains draw all the way up ---------- */

function Intro() {
  const reduce = useReducedMotion();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGone(true), INTRO_DONE * 1000 + 200);
    return () => clearTimeout(t);
  }, []);

  if (reduce || gone) return null;

  return (
    <div className={s.intro} aria-hidden="true">
      {Array.from({ length: COLS }).map((_, i) => (
        <div key={i} className={s.introCol}>
          <motion.div
            className={s.introPink}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.9, ease: CURTAIN_EASE, delay: 0.8 + i * 0.09 }}
          />
          <motion.div
            className={s.introBlack}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.9, ease: CURTAIN_EASE, delay: 0.55 + i * 0.09 }}
          />
        </div>
      ))}
      <motion.div
        className={s.introMark}
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25, delay: 0.45 }}
      >
        <Image src="/fox.png" alt="" width={96} height={96} priority sizes="96px" />
      </motion.div>
    </div>
  );
}

/* ---------- Small pieces ---------- */

function Roll({ children }: { children: string }) {
  // Text that rolls up to a copy of itself on hover.
  return (
    <span className={s.roll}>
      <span className={s.rollInner}>
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M7 17L17 7M17 7H8.5M17 7v8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return { copied, copy };
}

/* ---------- Menu ---------- */

const MENU_LINKS = [
  { label: "Book a call", href: CAL_URL, note: "Discovery call" },
  { label: "Talk to me", href: X_URL, note: X_HANDLE },
  { label: "Email", href: `mailto:${EMAIL}`, note: EMAIL },
  { label: "AI Labs", href: X_URL, note: "Coming soon", soon: true },
];

function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={s.menu}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial="closed"
          animate="open"
          exit="closed"
        >
          <div className={s.menuCurtains} aria-hidden="true">
            {Array.from({ length: COLS }).map((_, i) => (
              <motion.div
                key={i}
                className={s.menuCurtain}
                variants={{
                  closed: { scaleY: 0, transition: { duration: 0.5, ease: CURTAIN_EASE, delay: (COLS - 1 - i) * 0.04 } },
                  open: { scaleY: 1, transition: { duration: 0.6, ease: CURTAIN_EASE, delay: i * 0.05 } },
                }}
              />
            ))}
          </div>

          <nav className={s.menuNav}>
            {MENU_LINKS.map((l, i) => (
              <div key={l.label} className={s.menuRow}>
                <motion.a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={s.menuLink}
                  onClick={onClose}
                  variants={{
                    closed: { y: "110%", transition: { duration: 0.3 } },
                    open: { y: "0%", transition: { duration: 0.7, ease: OUT_EASE, delay: 0.35 + i * 0.07 } },
                  }}
                >
                  <span className={s.menuIndex}>0{i + 1}</span>
                  <span className={s.menuLabel}>{l.label}</span>
                  <span className={l.soon ? s.menuSoon : s.menuNote}>{l.note}</span>
                </motion.a>
              </div>
            ))}
          </nav>

          <motion.div
            className={s.menuFoot}
            variants={{
              closed: { opacity: 0, transition: { duration: 0.15 } },
              open: { opacity: 1, transition: { delay: 0.7, duration: 0.4 } },
            }}
          >
            <span>1655.studio</span>
            <span>System studio · India → worldwide</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Page ---------- */

const HEADLINE = [
  { text: "Your content", pink: false },
  { text: "sells.", pink: false },
  { text: "Your link", pink: false },
  { text: "leaks.", pink: true },
];

const TICKER = [
  "Offer",
  "Home base",
  "Checkout",
  "Emails",
  "Kajabi",
  "Skool",
  "Newsletter",
  "Sell without the DM chase",
];

export default function Site() {
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const { copied, copy } = useCopy();
  const base = reduce ? 0 : INTRO_DONE - 0.45;

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { y: "110%" },
          animate: { y: "0%" },
          transition: { duration: 0.9, ease: OUT_EASE, delay },
        };

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: OUT_EASE, delay },
        };

  return (
    <>
      <Intro />

      <header className={`${s.header} ${menuOpen ? s.headerOpen : ""}`}>
        <a href="/" className={s.brand} aria-label="1655 Studio home">
          <Image src="/fox.png" alt="" width={44} height={44} priority sizes="44px" className={s.fox} />
          <span className={s.wordmark}>1655.studio</span>
        </a>

        <span className={s.status}>
          <span className={s.pulse} aria-hidden="true" />
          Booking one client at a time
        </span>

        <button
          className={s.menuBtn}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <Roll>{menuOpen ? "Close" : "Menu"}</Roll>
          <span className={`${s.burger} ${menuOpen ? s.burgerOpen : ""}`} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </header>

      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main>
        {/* Hero */}
        <section className={s.hero}>
          <motion.div className={s.metaRow} {...fade(base)}>
            <span>(01) System studio</span>
            <span>New site in the oven</span>
          </motion.div>

          <h1 className={s.headline}>
            {HEADLINE.map((l, i) => (
              <span key={l.text} className={s.lineMask}>
                <motion.span
                  className={`${s.line} ${l.pink ? s.pinkText : ""}`}
                  {...rise(base + i * 0.08)}
                >
                  {l.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <div className={s.heroFoot}>
            <motion.p className={s.lede} {...fade(base + 0.4)}>
              1655 writes the offer, builds the home base and wires up checkout
              and emails for creators, coaches and consultants who already sell
              a named offer. The full site drops soon. You don&apos;t have to wait.
            </motion.p>

            <motion.div className={s.ctaRow} {...fade(base + 0.5)}>
              <a className={s.ctaPrimary} href={CAL_URL} target="_blank" rel="noopener noreferrer">
                <Roll>Book a call</Roll>
                <span className={s.ctaIcon}>
                  <Arrow />
                </span>
              </a>
              <a className={s.ctaGhost} href={X_URL} target="_blank" rel="noopener noreferrer">
                <Roll>Talk to me on X</Roll>
                <span className={s.ctaHandle}>{X_HANDLE}</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Ticker */}
        <div className={s.ticker} aria-hidden="true">
          <div className={s.tickerTrack}>
            {[0, 1].map((k) => (
              <div key={k} className={s.tickerGroup}>
                {TICKER.map((t) => (
                  <span key={t} className={s.tickerItem}>
                    {t}
                    <span className={s.star}>✺</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <section className={s.cards} aria-label="Ways to reach 1655">
          <a className={`${s.card} ${s.cardPink}`} href={CAL_URL} target="_blank" rel="noopener noreferrer">
            <span className={s.cardTag}>(A) Start here</span>
            <span className={s.cardTitle}>Book a call</span>
            <span className={s.cardBody}>
              One call to sort fit, scope, timeline, platforms and price.
            </span>
            <span className={s.cardArrow}>
              <Arrow />
            </span>
          </a>

          <a className={`${s.card} ${s.cardWhite}`} href={X_URL} target="_blank" rel="noopener noreferrer">
            <span className={s.cardTag}>(B) Talk to me</span>
            <span className={`${s.cardTitle} ${s.cardHandle}`}>{X_HANDLE}</span>
            <span className={s.cardBody}>DMs open. Teardowns and builds posted daily on X.</span>
            <span className={s.cardArrow}>
              <Arrow />
            </span>
          </a>

          <div className={`${s.card} ${s.cardOutline}`}>
            <span className={s.cardTag}>(C) Email</span>
            <a className={s.cardEmail} href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <span className={s.cardBody}>For briefs, intros and anything longer than a DM.</span>
            <div className={s.cardActions}>
              <a className={s.miniBtn} href={`mailto:${EMAIL}`}>
                Write
              </a>
              <button className={s.miniBtn} onClick={() => copy(EMAIL)} aria-live="polite">
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>

          <a className={`${s.card} ${s.cardLabs}`} href={X_URL} target="_blank" rel="noopener noreferrer">
            <span className={s.cardTag}>
              (D) AI Labs <span className={s.soonBadge}>Coming soon</span>
            </span>
            <span className={s.cardTitle}>Tools in the lab</span>
            <span className={s.labsList}>
              <span>Shadra</span>
              <span>Moviq</span>
              <span>Stillframe</span>
            </span>
            <span className={s.cardBody}>Follow on X for the first drops.</span>
            <span className={s.cardArrow}>
              <Arrow />
            </span>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={s.footRow}>
          <span>© 2026 1655 Studio</span>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <a href={X_URL} target="_blank" rel="noopener noreferrer">
            X {X_HANDLE}
          </a>
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }}>
            Back to top ↑
          </a>
        </div>
        <div className={s.giant} aria-hidden="true">
          1655<span className={s.giantDot}>●</span>studio
        </div>
      </footer>
    </>
  );
}
