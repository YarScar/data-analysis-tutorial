import { useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { normalizeRow } from '../lib/fileProcessing'

export default function FileUpload({ onData }) {
  const fileRef = useRef()

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    const name = file.name.toLowerCase()
    if (name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transform: (value) => (typeof value === 'string' ? value.trim() : value),
        complete: (results) => onData(results.data.map(normalizeRow))
      })
    } else if (name.endsWith('.json')) {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result)
          // if array of objects
          const rows = Array.isArray(parsed) ? parsed : [parsed]
          onData(rows.map(normalizeRow))
        } catch (err) {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    } else if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
      // For large Excel files we parse server-side. POST file as form-data to /api/upload-excel
      const form = new FormData()
      form.append('file', file)
      try {
        const res = await fetch('/api/upload-excel', { method: 'POST', body: form })
        if (!res.ok) {
          const txt = await res.text()
          alert('Server Excel parse failed: ' + txt)
          return
        }
        const json = await res.json()
        onData((json && json.data) ? json.data : [])
      } catch (err) {
        alert('Failed to upload Excel for server parsing: ' + String(err))
      }
    } else {
      alert('Unsupported format. Please upload CSV or JSON.')
    }
  }

  return (
    <div>
      <label htmlFor="file-input" style={{display:'block', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--light-mocha)'}}>📤 Upload Your Data</label>
      <div style={{position: 'relative'}}>
        <input 
          id="file-input" 
          aria-label="Upload data file" 
          ref={fileRef} 
          type="file" 
          accept=".csv,.json,.xls,.xlsx"
          onChange={handleFile}
          style={{
            padding: '12px',
            border: '2px dashed rgba(214,167,122,0.4)',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
      </div>
      <p style={{marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--warm-taupe)', margin: '0.8rem 0 0 0'}}>CSV • JSON • Excel supported</p>
    </div>
  )
}
