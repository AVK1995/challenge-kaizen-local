/**
 * Pabbly Connect: the fulfilment hand-off.
 *
 * Analytics tells Meta and GA4 that a sale happened. This tells the automation
 * who bought, so the buyer actually receives what they paid for: the WhatsApp
 * invite, the joining details, the guide downloads, the row in a sheet.
 *
 * It is fired from the Razorpay webhook and nowhere else, for the same reason
 * the Purchase event is: the webhook is the only place a payment is proven, and
 * UPI buyers routinely never return to the confirmation page. A browser-side
 * hand-off would silently skip most Indian buyers.
 *
 * Failure here must never fail the webhook. Razorpay retries a non-200, and a
 * retry would re-fire Meta and GA4 and double-count the sale. So this reports
 * its own success and swallows its own errors: the caller logs the result and
 * still returns 200.
 */
export const pabblyReady = () => Boolean(process.env.PABBLY_WEBHOOK_URL);

export type PabblyPurchase = {
  paymentId: string;
  orderId?: string;
  name?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  amountRupees: number;
  currency: string;
  product: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export async function sendPabblyPurchase(
  p: PabblyPurchase,
): Promise<{ ok: boolean; status: number }> {
  const url = process.env.PABBLY_WEBHOOK_URL ?? '';
  if (!url) return { ok: false, status: 0 };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      /* Flat keys, no nesting: Pabbly maps fields one level deep, and a nested
         object arrives as an unusable blob in the step mapper. */
      body: JSON.stringify({
        event: 'purchase',
        payment_id: p.paymentId,
        order_id: p.orderId ?? '',
        name: p.name ?? '',
        first_name: p.firstName ?? '',
        last_name: p.lastName ?? '',
        email: p.email ?? '',
        phone: p.phone ?? '',
        amount: p.amountRupees,
        currency: p.currency,
        product: p.product,
        utm_source: p.utmSource ?? '',
        utm_medium: p.utmMedium ?? '',
        utm_campaign: p.utmCampaign ?? '',
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
