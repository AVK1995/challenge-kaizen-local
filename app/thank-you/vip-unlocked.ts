/**
 * What the VIP pass unlocked, as the confirmation page names it.
 *
 * Deliberately worded as things the buyer NOW HAS, not as a feature list. They
 * have already paid; the job of this block is to make the extra ₹500 feel
 * settled rather than to sell it again, so each line says what arrives and
 * when.
 *
 * Mirrors the VIP bullets in app/oto/copy.ts — same four items, same order.
 * If one list changes the other has to, or the page congratulates someone on
 * something they were not sold.
 */
export const VIP_UNLOCKED: { title: string; detail: string }[] = [
  {
    title: 'Your (Peri)Menopause Symptom Score',
    detail: 'Score yourself on Day 1, then again on Day 5 and see what moved.',
  },
  {
    title: 'Your Movement Readiness Check',
    detail: 'A guided check so you know what is safe for your joints right now.',
  },
  {
    title: 'Nervous System Reset with Prerna',
    detail: '10-minute guided breathwork, yours to keep.',
  },
  {
    title: 'Pranayam for Better Sleep',
    detail: "For the nights your mind will not settle.",
  },
];
