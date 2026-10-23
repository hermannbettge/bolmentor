import { supabase } from './supabase.js'

export async function redirectToCheckout(priceId) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ priceId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Checkout konnte nicht gestartet werden')
  }
  const { url } = await res.json()
  window.location.href = url
}

export async function redirectToCustomerPortal() {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/stripe/customer-portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Kundenportal nicht verfügbar')
  }
  const { url } = await res.json()
  window.location.href = url
}

function pick(current, future) {
  return new Date() >= new Date('2027-01-01T00:00:00Z') ? (future || current) : current
}

export const PRICES = {
  membershipMonthly: pick(import.meta.env.VITE_STRIPE_PRICE_MEMBERSHIP_MONTHLY, import.meta.env.VITE_STRIPE_PRICE_MEMBERSHIP_MONTHLY_2027),
  membershipAnnual:  pick(import.meta.env.VITE_STRIPE_PRICE_MEMBERSHIP_ANNUAL,  import.meta.env.VITE_STRIPE_PRICE_MEMBERSHIP_ANNUAL_2027),
  business:          pick(import.meta.env.VITE_STRIPE_PRICE_BUSINESS,        import.meta.env.VITE_STRIPE_PRICE_BUSINESS_2027),
  health:            pick(import.meta.env.VITE_STRIPE_PRICE_HEALTH,          import.meta.env.VITE_STRIPE_PRICE_HEALTH_2027),
  family:            pick(import.meta.env.VITE_STRIPE_PRICE_FAMILY,          import.meta.env.VITE_STRIPE_PRICE_FAMILY_2027),
  selfexpression:    pick(import.meta.env.VITE_STRIPE_PRICE_SELFEXPRESSION,  import.meta.env.VITE_STRIPE_PRICE_SELFEXPRESSION_2027),
  finance:           pick(import.meta.env.VITE_STRIPE_PRICE_FINANCE,         import.meta.env.VITE_STRIPE_PRICE_FINANCE_2027),
  career:            pick(import.meta.env.VITE_STRIPE_PRICE_CAREER,          import.meta.env.VITE_STRIPE_PRICE_CAREER_2027),
  lifephases:        pick(import.meta.env.VITE_STRIPE_PRICE_LIFEPHASES,      import.meta.env.VITE_STRIPE_PRICE_LIFEPHASES_2027),
  partnership:       pick(import.meta.env.VITE_STRIPE_PRICE_PARTNERSHIP,     import.meta.env.VITE_STRIPE_PRICE_PARTNERSHIP_2027),
  events:            pick(import.meta.env.VITE_STRIPE_PRICE_EVENTS,          import.meta.env.VITE_STRIPE_PRICE_EVENTS_2027),
  relationship:      pick(import.meta.env.VITE_STRIPE_PRICE_RELATIONSHIP,    import.meta.env.VITE_STRIPE_PRICE_RELATIONSHIP_2027),
}
