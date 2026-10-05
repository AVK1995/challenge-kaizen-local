import crypto from 'crypto';

import { NextResponse } from 'next/server';

import { PRODUCT_NAME } from '@/app/_landing/offer';
import { SITE_CONFIG, capiReady, isTestMode } from '@/lib/site-config';
import { sendCapiEvent, type Occupation } from '@/lib/meta-capi';
import { pabblyReady, sendPabblyRegistration } from '@/lib/pabbly';
import { readClientIp, readClientUserAgent, readEdgeGeo } from '@/lib/request-signals';

/**
 * Free registration: the modal's form posts here.
 *
 * One request does both jobs, in parallel:
 *   1. Pabbly — the lead record that drives the WhatsApp invite and the sheet.
 *   2. Meta CAPI registration_complete — with every match key we hold.
 *
 * The browser fires the pixel copy of registration_complete with the SAME
 * event_id once this returns, and Meta deduplicates the pair.
 *
 * This is a request from the registrant's own browser, so the IP, user agent
 * and edge location in its headers are theirs.
 */

const OCCUPATIONS: Occupation[] = ['working_professional', 'homemaker'];
const EVENT_ID = /^[A-Za-z0-9_-]{8,64}$/;

const truncate = (v: unknown, max = 256) => {
  const s = typeof v === 'string' ? v : v == null ? '' : String(v);
  return s.length > max ? s.slice(0, max) : s;
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad-json' }, { status: 400 });
  }

  const firstName = truncate(body.firstName, 80).trim();
  const lastName = truncate(body.lastName, 80).trim();
  const email = truncate(body.email, 160).trim().toLowerCase();
  const phone = truncate(body.phone, 20).replace(/\D/g, '');
  const city = truncate(body.city, 80).trim();
  const country = truncate(body.country, 2).trim().toLowerCase();
  const occupationRaw = truncate(body.occupation, 32).trim();

  if (
    !firstName ||
    !lastName ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone.length < 8 ||
    !city ||
    !/^[a-z]{2}$/.test(country) ||
    !occupationRaw
  ) {
    return NextResponse.json({ ok: false, reason: 'missing-fields' }, { status: 400 });
  }

  const occupation = OCCUPATIONS.includes(occupationRaw as Occupation)
    ? (occupationRaw as Occupation)
    : undefined;

  const clientEventId = typeof body.eventId === 'string' ? body.eventId : '';
  const eventId = EVENT_ID.test(clientEventId) ? clientEventId : crypto.randomUUID();

  const leadId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const clientIp = readClientIp(req);
  const clientUserAgent = readClientUserAgent(req);
  const geo = readEdgeGeo(req);

  const externalId = truncate(body.externalId, 64);
  const fbc = truncate(body.fbc);
  const fbp = truncate(body.fbp);
  const eventSourceUrl =
    truncate(body.eventSourceUrl, 300) || SITE_CONFIG.fallbackEventSourceUrl;
  const utm = (body.utm ?? {}) as Record<string, unknown>;

  const [pabbly, capi] = await Promise.all([
    pabblyReady()
      ? sendPabblyRegistration({
          leadId,
          createdAt,
          firstName,
          lastName,
          email,
          phone,
          city,
          countryCode: country,
          occupation: occupationRaw,
          fbc,
          fbp,
          clientIp,
          clientUserAgent,
          externalId,
          eventSourceUrl,
          isTest: isTestMode(),
          registrationEventId: eventId,
          utmSource: truncate(utm.source, 100),
          utmMedium: truncate(utm.medium, 100),
          utmCampaign: truncate(utm.campaign, 100),
          utmContent: truncate(utm.content, 100),
          utmTerm: truncate(utm.term, 100),
          fbclid: truncate(body.fbclid, 200),
          referrer: truncate(body.referrer, 200),
          landingUrl: truncate(body.landingUrl, 300),
          product: PRODUCT_NAME,
          geoCountry: geo.country,
          geoCity: geo.city,
        })
      : Promise.resolve({ ok: false, status: 0 }),

    capiReady()
      ? sendCapiEvent({
          pixelId: SITE_CONFIG.meta.pixelId,
          accessToken: SITE_CONFIG.meta.accessToken,
          eventName: 'registration_complete',
          eventId,
          eventSourceUrl,
          /* Every match key Meta scores EMQ on: em, ph, fn, ln, ct, country,
             st, zp, external_id, fbc, fbp, client_ip_address and
             client_user_agent. Region and postcode come from the edge, because
             the form does not ask for them. */
          user: {
            email,
            phone,
            firstName,
            lastName,
            city,
            country,
            /* Only when the edge agrees the visitor is in the country they
               picked — a Dubai region attached to an Indian phone would be a
               confidently wrong key. */
            state: geo.country === country ? geo.region || undefined : undefined,
            zip: geo.country === country ? geo.zip || undefined : undefined,
            externalId: externalId || undefined,
            fbc: fbc || undefined,
            fbp: fbp || undefined,
            clientIp: clientIp || undefined,
            clientUserAgent: clientUserAgent || undefined,
          },
          occupation,
          testEventCode: SITE_CONFIG.meta.testEventCode || undefined,
        })
      : Promise.resolve({ ok: false, status: 0, body: 'capi-not-configured' }),
  ]);

  if (!pabbly.ok) {
    /* Loud, because a lead that never reaches Pabbly never gets the WhatsApp
       invite. The registrant still moves on: the thank-you page tells them the
       invite is coming, and the CAPI event and these logs keep a trace. */
    console.error(
      `[register] pabbly failed status=${pabbly.status} lead=${leadId} email=${email}`,
    );
  }
  if (!capi.ok && capiReady()) {
    console.error(`[register] capi failed status=${capi.status}`, JSON.stringify(capi.body));
  }

  return NextResponse.json({
    ok: true,
    leadId,
    eventId,
    pabbly: pabbly.ok ? 'sent' : 'skipped',
    capi: capi.ok ? 'sent' : 'skipped',
  });
}
