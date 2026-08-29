import type { Metadata } from 'next';

import LegalPageLayout from '@/components/LegalPageLayout';

import { LEGAL } from '../_landing/legal';
import { PRICE } from '../_landing/offer';

export const metadata: Metadata = {
  title: `Refund Policy | ${LEGAL.brand}`,
  description: `Refund terms for the ${LEGAL.product}.`,
  robots: { index: true, follow: true },
};

/**
 * The refund window here is written to match the promise the landing page and
 * checkout already make: CTA_NOTE says a full refund if you do not love day
 * one. A policy that contradicts the button is worse than no policy, so if that
 * promise changes, this page changes with it.
 */
export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      effectiveDate={LEGAL.effectiveDate}
      intro={`We stand behind the ${LEGAL.product}. If Day One is not right for you, you get your money back. No forms, no argument.`}
    >
      <h2>1. The guarantee</h2>
      <p>
        If you join the {LEGAL.product} ({PRICE}) and decide after attending Day
        One that it is not right for you, email us and we will refund you in
        full. You do not need to give a reason.
      </p>

      <h2>2. How to request a refund</h2>
      <ul>
        <li>
          Email <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> from the same
          address you used at checkout.
        </li>
        <li>
          Use the subject line <strong>&ldquo;Refund Request: 5-Day Reset&rdquo;</strong>.
        </li>
        <li>
          Include your full name and the date of purchase. A line on what did not
          work is optional, and helps us improve.
        </li>
      </ul>

      <h2>3. When to request it</h2>
      <p>
        Requests must reach us <strong>before Day Two begins</strong>. The
        guarantee exists so you can judge the programme by experiencing it, not
        so the whole programme can be taken and then returned.
      </p>

      <h2>4. Processing time</h2>
      <p>
        Refunds are processed within 2 business days of your request. Once
        processed, banks typically take 5 to 7 business days to show the credit,
        which is outside our control.
      </p>

      <h2>5. Refund method</h2>
      <p>
        Refunds go back to the original payment method used at checkout: the same
        card, UPI ID or account. We cannot redirect a refund to a different
        method.
      </p>

      <h2>6. What is not refundable</h2>
      <ul>
        <li>Requests made after Day Two of your batch has begun.</li>
        <li>
          Requests made after all five live sessions of your batch have been
          attended.
        </li>
        <li>Access given free, as part of a giveaway, or at a promotional rate of zero.</li>
      </ul>

      <h2>7. Chargebacks</h2>
      <p>
        Please email us before raising a dispute with your bank. Refunds within
        the window above are automatic, and a chargeback simply takes longer for
        everyone.
      </p>

      <h2>8. Contact</h2>
      <p>
        {LEGAL.entity}, trading as {LEGAL.tradeName}, {LEGAL.address}.
        <br />
        Questions about this policy:{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        {' · '}
        <a href={`tel:${LEGAL.phoneHref}`}>{LEGAL.phone}</a>.
      </p>
    </LegalPageLayout>
  );
}
