import { describe, it, expect } from 'vitest'
import { analyzeDataQuality } from '../../src/lib/dataAnalysis.js'

const sample = [
  { id: 1, name: 'A', age: 30, price: 10 },
  { id: 2, name: 'B', age: null, price: 0 },
  { id: 3, name: 'C', age: 25, price: -1 },
  { id: 3, name: 'C', age: 25, price: -1 }
]

describe('analyzeDataQuality', () => {
  it('returns expected structure and score', () => {
    const res = analyzeDataQuality(sample)
    expect(res).toBeTruthy()
    expect(res.rowCount).toBe(4)
    expect(typeof res.score).toBe('number')
    expect(res.missingness).toHaveProperty('age')
    expect(res.duplicates).toBeGreaterThanOrEqual(1)
  })
})
