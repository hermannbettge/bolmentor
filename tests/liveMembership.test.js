import test from 'node:test'
import assert from 'node:assert/strict'
import { hasMembership } from '../src/lib/membership.js'

test('December workshop access ends at Berlin midnight', () => {
  const profile = { membership_active: false, live_membership_until: '2026-12-31' }
  assert.equal(hasMembership(profile, new Date('2026-12-31T22:59:00Z')), true)
  assert.equal(hasMembership(profile, new Date('2026-12-31T23:01:00Z')), false)
})

test('Existing MAYA membership and admin access remain valid', () => {
  const afterDecember = new Date('2027-01-02T12:00:00Z')
  assert.equal(hasMembership({ membership_active: true }, afterDecember), true)
  assert.equal(hasMembership({ is_admin: true }, afterDecember), true)
  assert.equal(hasMembership({ membership_active: false }, afterDecember), false)
})
