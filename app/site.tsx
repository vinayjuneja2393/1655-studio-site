"use client";

import Image from "next/image";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BuiltFor, GlitchMark } from "./glitch-logo";
import { CAL_URL, EMAIL, LABS, X_HANDLE, X_URL } from "./links";
import s from "./site.module.css";

const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;
const OUT_EASE = [0.22, 1, 0.36, 1] as const;
const COLS = 6;
const LOGO = 2.2;
const CURTAINS_START = LOGO + 0.1;
// Last pink curtain: starts 0.25s after the black row, staggered across 6 columns.
const INTRO_DONE = CURTAINS_START + 0.25 + (COLS - 1) * 0.09 + 0.9;

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
            transition={{ duration: 0.9, ease: CURTAIN_EASE, delay: CURTAINS_START + 0.25 + i * 0.09 }}
          />
          <motion.div
            className={s.introBlack}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.9, ease: CURTAIN_EASE, delay: CURTAINS_START + i * 0.09 }}
          />
        </div>
      ))}
      <motion.div
        className={s.introMark}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.12, delay: LOGO }}
      >
        <div className={s.loader}>
          <GlitchMark duration={LOGO} />
          <BuiltFor start={0.3} each={0.6} />
        </div>
      </motion.div>
    </div>
  );
}

function Roll({ children }: { children: string }) {
  return (
    <span className={s.roll}>
      <span className={s.rollInner}>
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

function Arrow() {
  return (
    <svg className={s.arrow} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M6.5 17.5L16 8M8 8h8v8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button className={s.copyBtn} onClick={copy} aria-live="polite">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

type Row = { label: string; detail: string; href?: string; copy?: boolean; newTab?: boolean };

const CONTACT: Row[] = [
  { label: "Book a call", detail: "cal.com/1655studio", href: CAL_URL },
  { label: "Talk to me", detail: `${X_HANDLE} on X`, href: X_URL },
  { label: "Email", detail: EMAIL, href: `mailto:${EMAIL}`, copy: true },
];

const LAB_ROWS: Row[] = LABS.map((lab) => ({
  label: lab.name,
  detail: lab.blurb,
  href: `/labs/${lab.slug}`,
  newTab: true,
}));

const MENU: Row[] = [
  ...CONTACT,
  { label: "AI Labs", detail: LABS.map((lab) => lab.name).join(", "), href: "/labs" },
];

function RowLink({ row, onClick }: { row: Row; onClick?: () => void }) {
  const body = (
    <>
      <span className={s.rowLabel}>{row.label}</span>
      <span className={s.rowDetail}>{row.detail}</span>
      {!row.href ? <span /> : row.copy ? <span className={s.copySlot} /> : <Arrow />}
    </>
  );
  if (!row.href) return <div className={s.rowStatic}>{body}</div>;
  const newTab = row.newTab || row.href.startsWith("http");
  return (
    <a
      className={s.rowLink}
      href={row.href}
      onClick={onClick}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
    >
      {body}
    </a>
  );
}

function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    navRef.current?.querySelector("a")?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
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
                variants={{
                  closed: { scaleY: 0, transition: { duration: 0.32, ease: CURTAIN_EASE, delay: (COLS - 1 - i) * 0.025 } },
                  open: { scaleY: 1, transition: { duration: 0.45, ease: CURTAIN_EASE, delay: i * 0.035 } },
                }}
              />
            ))}
          </div>

          <nav ref={navRef} className={s.rows}>
            {MENU.map((row, i) => (
              <div key={row.label} className={s.rowMask}>
                <motion.div
                  variants={{
                    closed: { y: "110%", transition: { duration: 0.18 } },
                    open: { y: "0%", transition: { duration: 0.5, ease: OUT_EASE, delay: 0.22 + i * 0.045 } },
                  }}
                >
                  <RowLink row={row} onClick={onClose} />
                </motion.div>
              </div>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const HEADLINE = [
  { text: "Your content", pink: false },
  { text: "sells.", pink: false },
  { text: "Your link", pink: false },
  { text: "leaks.", pink: true },
];

const LABS_HEADLINE = [
  { text: "AI", pink: false },
  { text: "Labs.", pink: true },
];

function LabsList({ title }: { title: string }) {
  return (
    <section id="labs" className={s.list} aria-labelledby="labs-title">
      <h2 id="labs-title" className={s.listTitle}>
        {title}
      </h2>
      <div className={s.rows}>
        {LAB_ROWS.map((row) => (
          <RowLink key={row.label} row={row} />
        ))}
      </div>
    </section>
  );
}

const rise = (delay: number) => ({
  initial: { y: "110%" },
  animate: { y: "0%" },
  transition: { duration: 0.7, ease: OUT_EASE, delay },
});

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: OUT_EASE, delay },
});

function HomeMain() {
  const base = INTRO_DONE - 0.45;
  return (
    <main>
      <section className={s.hero}>
        <h1 className={s.headline}>
          {HEADLINE.map((l, i) => (
            <span key={l.text} className={s.lineMask}>
              <motion.span className={`${s.line} ${l.pink ? s.pinkText : ""}`} {...rise(base + i * 0.07)}>
                {l.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className={s.heroFoot}>
          <motion.p className={s.lede} {...fade(base + 0.35)}>
            1655 writes the offer, builds the home base and wires up checkout and emails for creators, coaches and
            consultants who already sell a named offer. The full site is on its way. You don&rsquo;t have to wait for it.
          </motion.p>

          <motion.a
            className={s.cta}
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            {...fade(base + 0.45)}
          >
            <Roll>Book a call</Roll>
            <span className={s.ctaIcon}>
              <Arrow />
            </span>
          </motion.a>
        </div>
      </section>

      <section className={s.list} aria-labelledby="contact-title">
        <h2 id="contact-title" className={s.listTitle}>
          Get in touch
        </h2>
        <div className={s.rows}>
          {CONTACT.map((row) => (
            <div key={row.label} className={s.rowWrap}>
              <RowLink row={row} />
              {row.copy && <CopyEmail />}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function LabsMain() {
  const base = 0.1;
  return (
    <main>
      <section className={`${s.hero} ${s.pageHero}`}>
        <h1 className={s.headline}>
          {LABS_HEADLINE.map((l, i) => (
            <span key={l.text} className={s.lineMask}>
              <motion.span className={`${s.line} ${l.pink ? s.pinkText : ""}`} {...rise(base + i * 0.07)}>
                {l.text}
              </motion.span>
            </span>
          ))}
        </h1>
        <div className={s.heroFoot}>
          <motion.p className={s.lede} {...fade(base + 0.25)}>
            Tools built at 1655. Each one runs in your browser and opens in its own tab.
          </motion.p>
        </div>
      </section>

      <LabsList title="Tools" />
    </main>
  );
}

export default function Site({ page = "home" }: { page?: "home" | "labs" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const home = page === "home";

  const closeMenu = () => {
    setMenuOpen(false);
    menuBtn.current?.focus({ preventScroll: true });
  };

  return (
    <MotionConfig reducedMotion="user">
      {home && <Intro />}

      <header className={`${s.header} ${menuOpen ? s.headerOpen : ""}`}>
        <a href="/" className={s.brand} aria-label="1655 Studio home">
          <Image src="/logo.svg" alt="" width={44} height={44} priority unoptimized className={s.fox} />
          <span className={s.wordmark}>1655.studio</span>
        </a>

        <button
          ref={menuBtn}
          className={s.menuBtn}
          onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
        >
          <Roll>{menuOpen ? "Close" : "Menu"}</Roll>
          <span className={`${s.burger} ${menuOpen ? s.burgerOpen : ""}`} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </header>

      <Menu open={menuOpen} onClose={closeMenu} />

      {home ? <HomeMain /> : <LabsMain />}

      <footer className={s.footer}>
        <div className={s.footRow}>
          <span>© 2026 1655 Studio</span>
          <span>Vinay Juneja, Verified Framer Expert</span>
        </div>
        <div className={s.giant} aria-hidden="true">
          1655<span className={s.giantDot}>●</span>studio
        </div>
      </footer>
    </MotionConfig>
  );
}
