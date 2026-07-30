"use client";

import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/LocaleContext";
import {
  LOCALES,
  LOCALE_COUNTRY,
  LOCALE_NATIVE_NAME,
  type Locale,
} from "@/i18n/locales";
import Flag from "./Flag";

/**
 * The language picker.
 *
 * Bootstrap's dropdown *styles* are used but not its JavaScript — the app loads
 * only `bootstrap.min.css`, so `data-bs-toggle` would do nothing. Open state,
 * dismissal and focus are handled here instead. `data-bs-popper="static"` is what
 * makes Bootstrap's own positioning rules apply in the absence of Popper.
 */
const LanguageSelector: React.FC = () => {
  const { locale, setLocale, m } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Escape has to leave focus somewhere sensible, not on a node that is
      // about to be display:none — which would drop it to the document body.
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const choose = (next: Locale) => {
    setLocale(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="dropdown" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
        // The visible text has to be *inside* the accessible name, not replaced
        // by it: a bare "Cambiar idioma" never says which language is active,
        // and voice control matches on what is on screen (WCAG 2.5.3).
        aria-label={`${m.language.change}: ${LOCALE_NATIVE_NAME[locale]}`}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <Flag country={LOCALE_COUNTRY[locale]} className="border" />
        <span>{LOCALE_NATIVE_NAME[locale]}</span>
      </button>

      <ul
        className={`dropdown-menu dropdown-menu-end${open ? " show" : ""}`}
        data-bs-popper="static"
        role="menu"
        aria-label={m.language.label}
      >
        {LOCALES.map((option) => (
          <li key={option}>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={option === locale}
              className={`dropdown-item d-flex align-items-center gap-2${
                option === locale ? " active" : ""
              }`}
              onClick={() => choose(option)}
            >
              <Flag country={LOCALE_COUNTRY[option]} className="border" />
              <span>{LOCALE_NATIVE_NAME[option]}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSelector;
