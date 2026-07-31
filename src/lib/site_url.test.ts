import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site_url";

describe("resolveSiteUrl", () => {
  it("prefers an explicit override", () => {
    expect(
      resolveSiteUrl({
        siteUrl: "https://dolarblue.example",
        vercelProductionUrl: "project.vercel.app",
      }).toString()
    ).toBe("https://dolarblue.example/");
  });

  // Vercel hands over a bare hostname, with no scheme on it.
  it("gives the Vercel hostname a scheme", () => {
    expect(
      resolveSiteUrl({ vercelProductionUrl: "project.vercel.app" }).origin
    ).toBe("https://project.vercel.app");
  });

  it("falls back to localhost when nothing is set", () => {
    expect(resolveSiteUrl({}).origin).toBe("http://localhost:3000");
  });

  // An unset variable can arrive as "" rather than undefined, and `new URL("")`
  // throws — so absent and empty have to mean the same thing.
  it.each([
    ["an empty override", { siteUrl: "" }, "http://localhost:3000"],
    ["an empty Vercel host", { vercelProductionUrl: "" }, "http://localhost:3000"],
    [
      "an empty override beside a real Vercel host",
      { siteUrl: "", vercelProductionUrl: "project.vercel.app" },
      "https://project.vercel.app",
    ],
  ])("treats %s as absent", (_name, env, expected) => {
    expect(resolveSiteUrl(env).origin).toBe(expected);
  });

  it("keeps a path on an override", () => {
    expect(
      resolveSiteUrl({ siteUrl: "https://example.test/app" }).toString()
    ).toBe("https://example.test/app");
  });
});
