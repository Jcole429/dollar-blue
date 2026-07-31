"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Locale } from "./locales";
import { MESSAGES, type Messages } from "./messages";

interface LocaleContextProps {
  locale: Locale;
  /** The active catalog. Named short because it appears in nearly every line of JSX. */
  m: Messages;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

/**
 * Hands the active catalog to the client components below it.
 *
 * The locale is a prop, taken from the `[locale]` path segment, and pointedly
 * not state. The URL is the single source of truth for what language a render
 * is in, which is what lets `<html lang>`, the metadata and every visible
 * string be decided on the server and prerendered together. There is nothing
 * here to correct after hydration, so there is no first frame in the wrong
 * language.
 *
 * This used to read `localStorage` in an effect, which meant the first render
 * was always the default. A cookie read would have fixed the flash but opted
 * the route out of static rendering; the segment gives both, because each
 * language is simply its own prerendered route. Anything that reintroduces a
 * request read here gives that back.
 *
 * Changing language is therefore a navigation, not a `setState` — see
 * LanguageSelector — and there is no setter in this context to reach for.
 */
export const LocaleProvider: React.FC<{
  locale: Locale;
  children: ReactNode;
}> = ({ locale, children }) => {
  const value = useMemo(
    () => ({ locale, m: MESSAGES[locale] }),
    [locale]
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
