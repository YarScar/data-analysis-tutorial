"use client"
import dynamic from 'next/dynamic'
import FileUpload from '../components/FileUpload'
import DataPreview from '../components/DataPreview'
import QualityScore from '../components/QualityScore'
import DataVisualizations from '../components/DataVisualizations'
import AIInsights from '../components/AIInsights'
import ReportDownload from '../components/ReportDownload'
import QualitySummary from '../components/QualitySummary'
import { useState } from 'react'

export default function Home() {
  const [dataset, setDataset] = useState(null)
  const [analysis, setAnalysis] = useState(null)

  return (
    <div className="container">
      <section>
        <FileUpload onData={(data) => { setDataset(data); setAnalysis(null) }} />
      </section>

      {dataset && (
        <section style={{marginTop: '1rem'}}>
          <h2>Data Preview</h2>
          <DataPreview data={dataset} />
          <QualityScore data={dataset} onAnalyze={setAnalysis} />
          {analysis && (
            <>
              <QualitySummary analysis={analysis} />
              <DataVisualizations analysis={analysis} />
              <AIInsights analysis={analysis} data={dataset} />
            </>
          )}
          {analysis && <ReportDownload analysis={analysis} data={dataset} />}
        </section>
      )}
    </div>
  )
}
