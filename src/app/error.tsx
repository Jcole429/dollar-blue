"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container p-4 m-2 border rounded shadow-sm bg-light">
      <h2>Something went wrong</h2>
      <p className="mb-3">
        The page hit an unexpected error. Your inputs were not saved.
      </p>
      <button type="button" className="btn btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
