import Image from 'next/image';

/**
 * The Kaizen wordmark, one definition used by every surface.
 *
 * Vector, not the supplied PNGs, and deliberately: the mark is a fine script
 * with a lot of thin-to-thick modulation, which is exactly what degrades first
 * when a raster is scaled. The SVG is the client's own file from Logo/, with
 * the two fills re-tokenised — navy `#1F325C` for light surfaces, brand gold
 * `#F2DDB6` for the navy stage — and the dot set to the brand coral `#EE7778`.
 *
 * The dark-stage wordmark is GOLD, not warm white. Gold-script-on-navy is the
 * client's primary lockup (Logo/Square Logo.jpg) and is the single most
 * recognisable thing about the brand; setting it in cream would be a quiet
 * de-branding of the one element that carries the identity. It reads 11.2:1
 * on the navy stage, so nothing is traded for it.
 *
 * ⚠️ The supplied Logo/Kaizen_logo.svg carries `#EE7D00` (orange) on the dot,
 * while every PNG in the same folder shows coral. Coral is used here because it
 * matches the artwork the client actually uses; if the orange is correct, it is
 * a one-value change in both files under public/brand/.
 *
 * Not a link. On this page it would point at itself, and there is no other page
 * a reader mid-decision should be sent to.
 */
const RATIO = 108 / 43;

export default function BrandMark({
  height = 40,
  onDark = false,
  priority = false,
}: {
  height?: number;
  onDark?: boolean;
  priority?: boolean;
}) {
  return (
    <Image
      src={onDark ? '/brand/kaizen-mark-light.svg' : '/brand/kaizen-mark.svg'}
      alt="Kaizen"
      width={Math.round(height * RATIO)}
      height={height}
      priority={priority}
      style={{ height, width: 'auto' }}
    />
  );
}
