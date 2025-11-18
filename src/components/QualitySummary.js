export default function QualitySummary({ analysis }) {
  if (!analysis) return null

  const { score = 0, rowCount = 0, columnCount = 0, duplicates = 0 } = analysis
  const color = score >= 80 ? '#28a745' : score >= 50 ? '#ffc107' : '#dc3545'

  return (
    <div style={{display:'flex', alignItems:'center', gap:16, marginTop:12}}>
      <div style={{width:84, height:84, borderRadius:999, background:color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700}} aria-hidden>
        {score}
      </div>
      <div>
        <div><strong>Rows:</strong> {rowCount}</div>
        <div><strong>Columns:</strong> {columnCount}</div>
        <div><strong>Duplicates:</strong> {duplicates}</div>
      </div>
    </div>
  )
}
