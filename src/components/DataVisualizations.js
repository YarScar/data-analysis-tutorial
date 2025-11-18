import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function DataVisualizations({ analysis }) {
  if (!analysis) return null

  const labels = Object.keys(analysis.missingness || {})
  const data = labels.map((l) => analysis.missingness[l])

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Missing %',
        data,
        backgroundColor: 'rgba(75,192,192,0.6)'
      }
    ]
  }

  return (
    <div style={{maxWidth: 800, marginTop: 16}}>
      <h3>Data Quality Visualizations</h3>
      <div role="img" aria-label="Bar chart showing missingness percentage by column">
        <Bar data={chartData} />
      </div>
    </div>
  )
}
