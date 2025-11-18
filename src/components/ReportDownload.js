import Papa from 'papaparse'

function download(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ReportDownload({ analysis, data }) {
  if (!analysis) return null

  function downloadJSON() {
    const payload = { analysis, data }
    download('analysis-report.json', JSON.stringify(payload, null, 2), 'application/json')
  }

  function downloadCSV() {
    try {
      const csv = Papa.unparse(data || [])
      download('analysis-data.csv', csv, 'text/csv')
    } catch (err) {
      alert('Failed to create CSV')
    }
  }

  return (
    <div style={{marginTop: 12}}>
      <h4>Download Report</h4>
      <button type="button" aria-label="Download JSON report" onClick={downloadJSON} style={{marginRight:8}}>Download JSON Report</button>
      <button type="button" aria-label="Download data CSV" onClick={downloadCSV}>Download Data CSV</button>
      <div style={{marginTop:8}}>
        <button type="button" aria-label="Download server JSON report" onClick={() => serverDownload('json')} style={{marginRight:8}}>Download Server JSON</button>
        <button type="button" aria-label="Download server CSV" onClick={() => serverDownload('csv')}>Download Server CSV</button>
      </div>
    </div>
  )

  async function serverDownload(format = 'json') {
    try {
      const res = await fetch(`/api/report?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, data })
      })
      if (!res.ok) {
        const txt = await res.text()
        alert('Server report failed: ' + txt)
        return
      }
      const blob = await res.blob()
      // attempt to read filename from content-disposition
      const cd = res.headers.get('content-disposition') || ''
      const match = /filename="?([^";]+)"?/.exec(cd)
      const filename = match ? match[1] : (format === 'csv' ? 'analysis-data.csv' : 'analysis-report.json')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Server download error: ' + String(err))
    }
  }
}
