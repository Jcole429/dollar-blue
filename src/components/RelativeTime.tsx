"use client";

import React, { useEffect, useState } from "react";
import { describeAge } from "@/utils/format_date";
import { useI18n } from "@/i18n/LocaleContext";

/** How often the "x minutes ago" label is recomputed. */
const TICK_MS = 60_000;

/**
 * A self-updating "x minutes ago" label.
 *
 * The clock lives here rather than in the rate provider on purpose. When the tick
 * sat in the provider, every minute it produced a new context value and so
 * re-rendered every consumer — which transitively meant the converter, the
 * splitter and the selector, all to update two strings. Now the ticking state is
 * scoped to the only two nodes that display it.
 */
const RelativeTime: React.FC<{ date: Date | null | undefined }> = ({ date }) => {
  const { m } = useI18n();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Re-read the clock on mount, before the first tick is due. The server
    // renders this label once per revalidation window and ISR serves that HTML
    // for up to five minutes, so what arrives can already be minutes out of
    // date — and `suppressHydrationWarning` is precisely the flag that stops
    // React reconciling the difference. Setting it here corrects the label from
    // the client's own clock rather than relying on hydration to do it.
    setNow(Date.now());

    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // The server's clock and the client's can land either side of a minute
  // boundary, which is an expected mismatch rather than a bug worth warning on.
  return <span suppressHydrationWarning>{describeAge(date, now, m.age)}</span>;
};

export default RelativeTime;
