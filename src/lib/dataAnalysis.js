import { missingnessByColumn, duplicateRowCount, simpleTypeConsistency } from './qualityMetrics'

export function analyzeDataQuality(data) {
  if (!data || data.length === 0) return null

  const missingness = missingnessByColumn(data)
  const duplicates = duplicateRowCount(data)
  const typeConsistency = simpleTypeConsistency(data)

  // simple overall score: 100 - avg missing% - duplicates penalty
  const avgMissing = Object.values(missingness).reduce((a,b)=>a+b,0) / Object.values(missingness).length
  const duplicatePenalty = Math.min(duplicates / data.length * 100, 30)
  const score = Math.round((100 - avgMissing - duplicatePenalty) * 100) / 100

  return {
    score,
    missingness,
    duplicates,
    typeConsistency,
    rowCount: data.length,
    columnCount: Object.keys(data[0] || {}).length
  }
}
