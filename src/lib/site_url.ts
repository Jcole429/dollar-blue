/**
 * The origin every absolute URL in the metadata is built from.
 *
 * This matters more than it looks: without a `metadataBase`, Next resolves the
 * relative `alternates` against `http://localhost:3000` and the deployed page
 * ships hreflang links pointing at the reader's own machine.
 */

interface SiteUrlEnv {
  /** An explicit override, for a custom domain. */
  siteUrl?: string;
  /**
   * Vercel's *project* production domain — stable across deployments.
   *
   * Pointedly not `VERCEL_URL`, which is the per-deployment hostname and
   * changes on every push: a canonical or an hreflang built from that names a
   * deployment rather than the site.
   */
  vercelProductionUrl?: string;
}

export const resolveSiteUrl = (env: SiteUrlEnv): URL => {
  if (env.siteUrl) return new URL(env.siteUrl);
  if (env.vercelProductionUrl) {
    return new URL(`https://${env.vercelProductionUrl}`);
  }
  return new URL("http://localhost:3000");
};

// Read one variable at a time, as whole `process.env.X` literals, so Next's
// build-time substitution can see each of them.
export const SITE_URL = resolveSiteUrl({
  siteUrl: process.env.SITE_URL,
  vercelProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
});
