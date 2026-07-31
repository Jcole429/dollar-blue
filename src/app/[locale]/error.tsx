"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/LocaleContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Reachable because LocaleProvider sits in the layout beside this file, which
  // wraps the boundary — the page below it is what failed, not the language.
  // This has to stay inside `[locale]` for that reason: at `app/` it would sit
  // above the provider and every error would become a blank screen.
  const { m } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container p-4 m-2 border rounded shadow-sm bg-light">
      <h2>{m.error.title}</h2>
      <p className="mb-3">{m.error.body}</p>
      <button type="button" className="btn btn-primary" onClick={reset}>
        {m.error.retry}
      </button>
    </div>
  );
}
