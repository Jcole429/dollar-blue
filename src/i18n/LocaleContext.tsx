"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";
import { MESSAGES, type Messages } from "./messages";

const STORAGE_KEY = "dollar-blue.locale";

interface LocaleContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** The active catalog. Named short because it appears in nearly every line of JSX. */
  m: Messages;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

const readStoredLocale = (): Locale | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    // Storage can throw outright when it is disabled or the quota is gone. A
    // language preference is not worth taking the page down for.
    return null;
  }
};

/**
 * Holds the chosen language and hands out the matching catalog.
 *
 * The first render is **always** `DEFAULT_LOCALE`, on the server and on the
 * client alike, and the stored preference is applied in an effect afterwards.
 * That ordering is deliberate: reading the preference from a cookie during the
 * server render would give a flash-free result, but it also opts the route out
 * of static rendering, and the page is deliberately served as cached HTML with
 * its quotes already in it. Since Spanish is both the default and what nearly
 * every visitor wants, the cost lands only on someone who has explicitly chosen
 * English — they see one frame of Spanish before hydration swaps it.
 */
export const LocaleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    // Skipping the no-op keeps the common case at exactly one render.
    if (stored !== null && stored !== DEFAULT_LOCALE) setLocaleState(stored);
  }, []);

  // `<html lang>` is server-rendered as the default and corrected here. It drives
  // screen-reader pronunciation and the browser's own translate prompt, so it has
  // to track the language actually on screen.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Same as the read: the choice still applies for this session.
    }
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, m: MESSAGES[locale] }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useI18n must be used within a LocaleProvider");
  }
  return context;
};
