export function inferColumns(data) {
  if (!data || data.length === 0) return []
  return Object.keys(data[0])
}

export function sampleValues(data, column, limit = 10) {
  return data.slice(0, limit).map((r) => r[column])
}

export function normalizeRow(row) {
  const out = {}
  for (const k of Object.keys(row)) {
    let v = row[k]
    if (typeof v === 'string') {
      v = v.trim()
      if (v === '') v = null
      else if (/^-?\d+(?:\.\d+)?$/.test(v)) {
        // numeric string -> number
        const n = Number(v)
        if (!Number.isNaN(n)) v = n
      }
    }
    // leave other types as-is (null, number, boolean)
    out[k] = v
  }
  return out
}

