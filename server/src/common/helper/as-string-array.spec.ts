import { asStringArray } from './as-string-array'

describe('asStringArray', () => {
    it('returns string items from an array', () => {
        expect(asStringArray(['a', 'b'])).toEqual(['a', 'b'])
    })

    it('drops non-string items', () => {
        expect(asStringArray(['ok', 1, null, 'yes'])).toEqual(['ok', 'yes'])
    })

    it('returns an empty array for non-arrays', () => {
        expect(asStringArray(undefined)).toEqual([])
        expect(asStringArray(null)).toEqual([])
        expect(asStringArray('x')).toEqual([])
        expect(asStringArray({ length: 1 })).toEqual([])
    })
})
