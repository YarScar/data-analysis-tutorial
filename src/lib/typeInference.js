function isISODateString(s) {
  // simple ISO date test YYYY-MM-DD or with time
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(s)
}

export function inferColumnStats(data) {
  if (!data || data.length === 0) return {}

  const cols = Object.keys(data[0])
  const stats = {}

  cols.forEach((c) => {
    const values = data.map((r) => r[c])
    const nonNull = values.filter((v) => v !== null && v !== undefined)
    const missingCount = values.length - nonNull.length
    const missingPercent = Math.round((missingCount / values.length) * 10000) / 100

    // type detection: prefer number, date, boolean, else string
    let type = 'string'
    if (nonNull.every((v) => typeof v === 'number')) type = 'number'
    else if (nonNull.every((v) => typeof v === 'boolean')) type = 'boolean'
    else if (nonNull.every((v) => isISODateString(String(v)))) type = 'date'
    else if (nonNull.every((v) => /^-?\d+(?:\.\d+)?$/.test(String(v)))) type = 'number'

    const uniqueVals = Array.from(new Set(nonNull.map((v) => (v === null ? '__null__' : String(v)))))

    const colStat = {
      column: c,
      type,
      missingCount,
      missingPercent,
      uniqueCount: uniqueVals.length,
      sampleValues: nonNull.slice(0, 5)
    }

    if (type === 'number') {
      const nums = nonNull.map(Number).filter((n) => !Number.isNaN(n))
      const sum = nums.reduce((a, b) => a + b, 0)
      const mean = nums.length ? sum / nums.length : null
      const sorted = nums.slice().sort((a, b) => a - b)
      const min = nums.length ? sorted[0] : null
      const max = nums.length ? sorted[sorted.length - 1] : null
      colStat.min = min
      colStat.max = max
      colStat.mean = mean
      colStat.median = nums.length ? sorted[Math.floor(sorted.length / 2)] : null
    }

    if (type === 'date') {
      const dates = nonNull.map((v) => new Date(v)).filter((d) => !Number.isNaN(d.getTime()))
      if (dates.length) {
        const minD = new Date(Math.min(...dates.map((d) => d.getTime())))
        const maxD = new Date(Math.max(...dates.map((d) => d.getTime())))
        colStat.minDate = minD.toISOString()
        colStat.maxDate = maxD.toISOString()
      }
    }

    stats[c] = colStat
  })

  return stats
}
