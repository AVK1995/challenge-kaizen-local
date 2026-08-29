/**
 * Cache-buster for artwork under /public.
 *
 * Replacing an image while keeping its filename does NOT get the new artwork
 * in front of anyone. The path is the cache key in three separate places: the
 * visitor's browser, the CDN edge, and Next's image optimizer, which stores the
 * resized and re-encoded copies against the source URL. All three keep serving
 * the old bytes, and the stale copy usually looks correct to whoever replaced
 * the file, because their own browser fetched it fresh.
 *
 * So every replaced asset gets a new URL instead. Bump this ONE value in the
 * same pass as any artwork swap and every reference below moves together.
 *
 * v2: 29 Aug 2026, hero card art and the day-card / system-stack artwork
 *     regenerated against the revised five-day schedule.
 */
export const ASSET_V = '2';

/** Appends the version to a /public path. */
export const asset = (path: string) => `${path}?v=${ASSET_V}`;
