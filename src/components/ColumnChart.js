import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function ColumnChart({ column, stats, data, selectedColumn }) {
  if (!column || !stats) return null

  const col = stats[column]
  if (!col) return <div>No stats for column</div>

  if (col.type === 'number') {
    // create simple histogram
    const nums = data.map((r) => r[column]).filter((v) => v !== null && v !== undefined && v !== '')
      .map(Number).filter((n) => !Number.isNaN(n))
    if (nums.length === 0) return <div>No numeric data</div>
    const min = Math.min(...nums)
    const max = Math.max(...nums)
    const bins = 8
    const binSize = (max - min) / bins || 1
    const counts = new Array(bins).fill(0)
    nums.forEach((n) => {
      let idx = Math.floor((n - min) / binSize)
      if (idx < 0) idx = 0
      if (idx >= bins) idx = bins - 1
      counts[idx]++
    })
    const labels = counts.map((_, i) => `${Math.round(min + i*binSize)}-${Math.round(min + (i+1)*binSize)}`)
    const chartData = { labels, datasets: [{ label: column, data: counts, backgroundColor: 'rgba(54,162,235,0.6)' }] }
    return (
      <div style={{maxWidth:600, marginTop:12, border: selectedColumn === column ? '2px solid #88c' : undefined, padding: selectedColumn === column ? 8 : undefined}}>
        <h4>Distribution: {column} {selectedColumn === column ? <em style={{fontSize:12, color:'#336'}}> (selected)</em> : null}</h4>
        <Bar data={chartData} />
      </div>
    )
  }

  // categorical
  const vals = data.map((r) => r[column]).filter((v) => v !== null && v !== undefined && v !== '')
  const countsMap = {}
  vals.forEach((v) => { const k = String(v); countsMap[k] = (countsMap[k]||0)+1 })
  const labels = Object.keys(countsMap).slice(0, 12)
  const counts = labels.map((l) => countsMap[l])
  const chartData = { labels, datasets: [{ label: column, data: counts, backgroundColor: 'rgba(153,102,255,0.6)' }] }
  return (
    <div style={{maxWidth:600, marginTop:12, border: selectedColumn === column ? '2px solid #88c' : undefined, padding: selectedColumn === column ? 8 : undefined}}>
      <h4>Categories: {column} {selectedColumn === column ? <em style={{fontSize:12, color:'#336'}}> (selected)</em> : null}</h4>
      <Bar data={chartData} />
    </div>
  )
}
