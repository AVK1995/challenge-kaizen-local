/**
 * The business facts every legal page needs.
 *
 * ⚠️ PLACEHOLDERS. Razorpay will not approve a live account against these, and
 * a policy naming the wrong entity is worse than no policy. Every value marked
 * TODO must be replaced with what is actually registered before this funnel
 * takes money. They are collected here rather than scattered through three
 * pages so it is one edit, and so a placeholder cannot hide in a paragraph.
 */
export const LEGAL = {
  /** TODO: the registered entity, exactly as it appears on the GST / PAN record. */
  entity: '[TODO: registered business name]',
  /** TODO: registered address, including PIN. */
  address: '[TODO: registered address]',
  /** TODO: the inbox that is actually monitored. */
  email: '[TODO: support@ email]',
  /** TODO: the city whose courts have jurisdiction. */
  jurisdiction: '[TODO: city]',
  /** TODO: the date these were published. */
  effectiveDate: '[TODO: date]',
  brand: 'Kaizen',
  product: '5-Day (Peri)Menopause Reset Challenge',
} as const;
