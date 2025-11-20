import { missingnessByColumn, duplicateRowCount, simpleTypeConsistency, detectOutliersIQR } from './qualityMetrics'
import { inferColumnStats } from './typeInference'

export function analyzeDataQuality(data) {
  if (!data || data.length === 0) return null

  const missingness = missingnessByColumn(data)
  const duplicates = duplicateRowCount(data)
  const typeConsistency = simpleTypeConsistency(data)

  const columnStats = inferColumnStats(data)

  // detect outliers per numeric column
  const outliers = {}
  Object.keys(columnStats).forEach((col) => {
    if (columnStats[col].type === 'number') {
      outliers[col] = detectOutliersIQR(data, col)
    }
  })

  // simple overall score: 100 - avg missing% - duplicates penalty
  const avgMissing = Object.values(missingness).reduce((a,b)=>a+b,0) / Object.values(missingness).length
  const duplicatePenalty = Math.min(duplicates / data.length * 100, 30)
  const score = Math.round((100 - avgMissing - duplicatePenalty) * 100) / 100

  return {
    score,
    missingness,
    duplicates,
    typeConsistency,
    columnStats,
    outliers,
    rowCount: data.length,
    columnCount: Object.keys(data[0] || {}).length
  }
}
