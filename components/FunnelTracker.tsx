'use client';

import { useEffect } from 'react';

import { trackViewItem } from '@/lib/track';

/**
 * Landing-page tracking, mounted once on the page. Renders nothing.
 *
 * Only ViewContent lives here. atc_event fires from the registration modal
 * when a CTA opens it, and registration_complete when its form is submitted —
 * see app/_landing/register-modal.tsx.
 */
export default function FunnelTracker() {
  useEffect(() => {
    /* ViewContent: the offer has been seen. Once per session, not per browser
       lifetime, so a returning visitor still feeds the retargeting audience. */
    trackViewItem();
  }, []);

  return null;
}
