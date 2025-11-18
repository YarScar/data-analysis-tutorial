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
