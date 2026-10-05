/**
 * Every server-side constant the registration and tracking routes need, in one
 * place.
 */
export const SITE_CONFIG = {
  /* The launch domain as the fallback, not example.com: this value is sent to
     Meta as event_source_url, so an unset env var would quietly attribute live
     events to a domain we do not own.

     `||`, not `??`. A host that defines the key with a blank value yields an
     empty string, which `??` passes straight through, and an empty
     event_source_url is silently worthless to Meta. */
  fallbackEventSourceUrl:
    (process.env.NEXT_PUBLIC_SITE_URL || '').trim() ||
    'https://challenge.kaizenwellness.app',
  meta: {
    pixelId: process.env.META_PIXEL_ID ?? '',
    accessToken: process.env.META_CAPI_ACCESS_TOKEN ?? '',
    testEventCode: process.env.META_CAPI_TEST_EVENT_CODE ?? '',
  },
} as const;

/** True only when a real CAPI call can be made. Routes check this and skip
 *  quietly rather than posting to Meta with an empty pixel id. */
export const capiReady = () =>
  Boolean(SITE_CONFIG.meta.pixelId && SITE_CONFIG.meta.accessToken);

/**
 * Whether this deployment is sending test traffic. Events sent with a Meta
 * test event code do not count toward optimisation, so a registration made
 * while one is set is treated as a test registration.
 *
 * It rides to Pabbly as `is_test` so a staging sign-up can be routed away from
 * the live WhatsApp invite instead of onboarding a fictional lead.
 */
export const isTestMode = () => Boolean(SITE_CONFIG.meta.testEventCode);
