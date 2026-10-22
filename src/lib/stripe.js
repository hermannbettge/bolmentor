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

// Price IDs come from env vars (set in Vite as VITE_STRIPE_PRICE_*)
export const PRICES = {
  membershipMonthly: import.meta.env.VITE_STRIPE_PRICE_MEMBERSHIP_MONTHLY,
  membershipAnnual:  import.meta.env.VITE_STRIPE_PRICE_MEMBERSHIP_ANNUAL,
  business:          import.meta.env.VITE_STRIPE_PRICE_BUSINESS,
  health:            import.meta.env.VITE_STRIPE_PRICE_HEALTH,
  family:            import.meta.env.VITE_STRIPE_PRICE_FAMILY,
  selfexpression:    import.meta.env.VITE_STRIPE_PRICE_SELFEXPRESSION,
  finance:           import.meta.env.VITE_STRIPE_PRICE_FINANCE,
  career:            import.meta.env.VITE_STRIPE_PRICE_CAREER,
  lifephases:        import.meta.env.VITE_STRIPE_PRICE_LIFEPHASES,
  partnership:       import.meta.env.VITE_STRIPE_PRICE_PARTNERSHIP,
}
