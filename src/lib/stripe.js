import { supabase } from './supabase.js'

export async function redirectToGuestCheckout(productKey) {
  const res = await fetch('/api/stripe/guest-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productKey }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Checkout konnte nicht gestartet werden')
  }
  const { url } = await res.json()
  window.location.href = url
}

export async function redirectToCheckout(productKey) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ productKey }),
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

