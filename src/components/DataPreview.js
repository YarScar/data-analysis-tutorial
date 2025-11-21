import '../styles/DataPreview.css'

export default function DataPreview({ data = [] }) {
  if (!data || data.length === 0) return <div>No data to preview</div>

  const columns = Object.keys(data[0])

  return (
    <div style={{overflowX: 'auto'}}>
      <table role="table" aria-label="Data preview table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c} data-label={c}>{String(row[c] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>Showing first 10 rows of {data.length}.</p>
    </div>
  )
}
