import { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo.png";
import dLetter from "../../assets/logo-letters/D.svg";
import eLetter from "../../assets/logo-letters/E.svg";
import nLetter from "../../assets/logo-letters/N.svg";
import lLetter from "../../assets/logo-letters/L.svg";
import aLetter from "../../assets/logo-letters/A.svg";
import mLetter from "../../assets/logo-letters/M.svg";
import "./SplashScreen.css";

const SESSION_KEY = "denlam-intro-played";

// Timings (ms)
const HOLD_BEFORE_CONVERGE = 50;
const CONVERGE_DURATION = 1200;
const REVEAL_DELAY = 150; // petit délai après la fin du resserrement, avant le basculement vers le vrai logo
const HOLD_AFTER_REVEAL = 1200; // pause bien visible, vrai logo affiché et immobile, avant l'envol
const FLY_DURATION = 1000;

const REFERENCE_WIDTH = 793;
const REFERENCE_HEIGHT = 192;

const LETTERS = [
  { id: "D", x: 62, y: 45, w: 129, h: 104, src: dLetter },
  { id: "E", x: 169, y: 47, w: 123, h: 102, src: eLetter },
  { id: "N", x: 264, y: 47, w: 123, h: 102, src: nLetter },
  { id: "L", x: 358, y: 47, w: 123, h: 102, src: lLetter },
  { id: "A", x: 458, y: 11, w: 157, h: 138, src: aLetter },
  { id: "M", x: 587, y: 45, w: 151, h: 104, src: mLetter },
];

const SPREAD_STEP = 68;
const SPREAD_MULTIPLIER = 1.3;
const CENTER_INDEX = (LETTERS.length - 1) / 2;

function initialOffset(index) {
  return (index - CENTER_INDEX) * SPREAD_STEP * SPREAD_MULTIPLIER;
}

/**
 * Affichée une seule fois par session de navigation : chaque lettre du
 * logo démarre écartée de sa voisine, se resserre pour reconstituer
 * "DENLAM" (assemblage approximatif à partir des fichiers vectoriels par
 * lettre) — puis, une fois assemblé, BASCULE vers le vrai logo (PNG,
 * parfaitement fidèle, y compris les accents de couleur) avant de
 * s'envoler vers sa position réelle dans l'en-tête. Ce basculement évite
 * d'avoir à caler chaque détail (accents, chevauchements) au pixel près
 * sur la reconstitution : elle n'a besoin d'être bonne qu'approximativement,
 * le vrai logo prenant le relais avant que quiconque ait le temps de
 * comparer les deux de près.
 *
 * Respecte "prefers-reduced-motion" via la règle globale déjà présente
 * dans index.css (transitions quasi instantanées dans ce cas).
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [phase, setPhase] = useState("spread");
  const [revealed, setRevealed] = useState(false);
  const groupRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    const timers = [];

    timers.push(setTimeout(() => setPhase("converge"), HOLD_BEFORE_CONVERGE));

    const revealAt = HOLD_BEFORE_CONVERGE + CONVERGE_DURATION + REVEAL_DELAY;
    timers.push(setTimeout(() => setRevealed(true), revealAt));

    const flyAt = revealAt + HOLD_AFTER_REVEAL;
    timers.push(
      setTimeout(() => {
        const target = document.querySelector(".site-header .logo img");
        const group = groupRef.current;

        if (target && group) {
          const targetRect = target.getBoundingClientRect();
          const groupRect = group.getBoundingClientRect();

          const scale = targetRect.height / groupRect.height;
          const deltaX = targetRect.left + targetRect.width / 2 - (groupRect.left + groupRect.width / 2);
          const deltaY = targetRect.top + targetRect.height / 2 - (groupRect.top + groupRect.height / 2);

          group.style.setProperty("--fly-x", `${deltaX}px`);
          group.style.setProperty("--fly-y", `${deltaY}px`);
          group.style.setProperty("--fly-scale", scale);
        }

        setPhase("fly");
      }, flyAt)
    );

    timers.push(setTimeout(() => setVisible(false), flyAt + FLY_DURATION));

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div className={`splash-screen splash-${phase}`} aria-hidden="true">
      <div className={`splash-group${revealed ? " splash-revealed" : ""}`} ref={groupRef}>
        <div className="splash-letters">
          {LETTERS.map((letter, index) => (
            <img
              key={letter.id}
              src={letter.src}
              alt=""
              className="splash-letter"
              style={{
                left: `${(letter.x / REFERENCE_WIDTH) * 100}%`,
                top: `${(letter.y / REFERENCE_HEIGHT) * 100}%`,
                width: `${(letter.w / REFERENCE_WIDTH) * 100}%`,
                height: `${(letter.h / REFERENCE_HEIGHT) * 100}%`,
                "--spread-offset": `${initialOffset(index)}px`,
              }}
            />
          ))}
        </div>

        <img src={logo} alt="" className="splash-final-logo" />
      </div>
    </div>
  );
}
