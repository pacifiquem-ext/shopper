import { describe, expect, it } from 'vitest'

import { isProductId, normalizeStoreSlug } from './store-slug'

describe('normalizeStoreSlug', () => {
  it('accepts a valid store slug', () => {
    expect(normalizeStoreSlug('my-store')).toBe('my-store')
  })

  it('rejects reserved or empty values', () => {
    expect(normalizeStoreSlug('www')).toBeNull()
    expect(normalizeStoreSlug('')).toBeNull()
    expect(normalizeStoreSlug('-bad')).toBeNull()
  })
})

describe('isProductId', () => {
  it('detects a uuid product id', () => {
    expect(isProductId('e2609407-c3c7-44ec-b75f-f60c530f499a')).toBe(true)
    expect(isProductId('my-store')).toBe(false)
  })
})
