import { analyzeDataQuality } from '../lib/dataAnalysis'

export default function QualityScore({ data, onAnalyze }) {
  function handleAnalyze() {
    const analysis = analyzeDataQuality(data)
    onAnalyze(analysis)
  }

  return (
    <div className="mt-2" style={{textAlign: 'center'}}>
      <button type="button" className="btn" aria-label="Analyze data quality" onClick={handleAnalyze} style={{fontSize: '1rem', padding: '12px 28px'}}>✨ Analyze Data Quality</button>
    </div>
  )
}
