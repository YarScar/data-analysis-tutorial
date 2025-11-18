import { analyzeDataQuality } from '../lib/dataAnalysis'

export default function QualityScore({ data, onAnalyze }) {
  function handleAnalyze() {
    const analysis = analyzeDataQuality(data)
    onAnalyze(analysis)
  }

  return (
    <div style={{marginTop: '1rem'}}>
      <button type="button" aria-label="Analyze data quality" onClick={handleAnalyze}>Analyze Data Quality</button>
    </div>
  )
}
