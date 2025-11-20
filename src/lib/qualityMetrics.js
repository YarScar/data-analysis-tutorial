export function missingnessByColumn(data) {
  const cols = Object.keys(data[0] || {})
  const total = data.length
  const result = {}
  cols.forEach((c) => {
    const missing = data.filter((r) => r[c] === null || r[c] === undefined || String(r[c]).trim() === '').length
    result[c] = Math.round((missing / total) * 100 * 100) / 100 // percent rounded
  })
  return result
}

export function duplicateRowCount(data) {
  const seen = new Set()
  let dups = 0
  data.forEach((r) => {
    const key = JSON.stringify(r)
    if (seen.has(key)) dups++
    else seen.add(key)
  })
  return dups
}

export function simpleTypeConsistency(data) {
  const cols = Object.keys(data[0] || {})
  const result = {}
  cols.forEach((c) => {
    const types = new Set(data.map((r) => typeof r[c]))
    result[c] = Array.from(types)
  })
  return result
}

export function detectOutliersIQR(data, column) {
  // return indices or count of outliers using IQR method for numeric columns
  const vals = data.map((r) => r[column]).filter((v) => v !== null && v !== undefined && v !== '')
  const nums = vals.map(Number).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b)
  if (nums.length < 4) return { count: 0, outliers: [] }
  const q1 = nums[Math.floor((nums.length / 4))]
  const q3 = nums[Math.floor((nums.length * 3) / 4)]
  const iqr = q3 - q1
  const lower = q1 - 1.5 * iqr
  const upper = q3 + 1.5 * iqr
  const outliers = nums.filter((n) => n < lower || n > upper)
  return { count: outliers.length, outliers }
}
