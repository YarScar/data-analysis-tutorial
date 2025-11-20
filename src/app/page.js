"use client"
import dynamic from 'next/dynamic'
import FileUpload from '../components/FileUpload'
import DataPreview from '../components/DataPreview'
import QualityScore from '../components/QualityScore'
import DataVisualizations from '../components/DataVisualizations'
import AIInsights from '../components/AIInsights'
import ReportDownload from '../components/ReportDownload'
import QualitySummary from '../components/QualitySummary'
import ColumnDetails from '../components/ColumnDetails'
import ColumnChart from '../components/ColumnChart'
import { getAIInsights } from '../lib/aiIntegration'
import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [dataset, setDataset] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [aiInsights, setAIInsights] = useState(null)

  async function handleRequestAI(column) {
    if (!analysis || !dataset) return
    // debounce rapid requests: schedule the actual fetch after a short delay
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    aiTimerRef.current = setTimeout(async () => {
      setAIInsights({ loading: true })
      try {
        const res = await getAIInsights({ analysis, sample: dataset.slice(0,5), column })
        setAIInsights(res)
      } catch (err) {
        setAIInsights({ error: String(err) })
      }
      aiTimerRef.current = null
    }, 600)
  }

  const aiTimerRef = useRef(null)

  useEffect(() => {
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current) }
  }, [])

  useEffect(() => {
    // When a new analysis is available, request overall dataset insights automatically
    if (!analysis) return
    handleRequestAI()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis])

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
              <DataVisualizations analysis={analysis} onSelectColumn={(col) => { setSelectedColumn(col); handleRequestAI(col) }} />
              <ColumnDetails analysis={analysis} selectedColumn={selectedColumn} onSelectColumn={setSelectedColumn} onRequestAI={handleRequestAI} />
              {selectedColumn && <ColumnChart column={selectedColumn} stats={analysis.columnStats} data={dataset} selectedColumn={selectedColumn} />}
              <AIInsights insights={aiInsights} />
            </>
          )}
          {analysis && <ReportDownload analysis={analysis} data={dataset} />}
        </section>
      )}
    </div>
  )
}
