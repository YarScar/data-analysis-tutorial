export default function QualitySummary({ analysis }) {
  if (!analysis) return null

  const { score = 0, rowCount = 0, columnCount = 0, duplicates = 0 } = analysis
  const color = score >= 80 ? '#28a745' : score >= 50 ? '#ffc107' : '#dc3545'
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 50 ? 'Fair' : 'Poor'

  return (
    <div style={{display:'flex', alignItems:'center', gap:24, marginTop:12, flexWrap: 'wrap'}}>
      <div style={{
        width:120, 
        height:120, 
        borderRadius:'50%', 
        background: `linear-gradient(135deg, ${color}dd, ${color})`,
        color:'white', 
        display:'flex', 
        flexDirection: 'column',
        alignItems:'center', 
        justifyContent:'center', 
        fontSize:36, 
        fontWeight:700,
        boxShadow: `0 8px 24px ${color}40`,
        transition: 'transform 0.3s ease',
        cursor: 'default'
      }} 
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05) rotate(5deg)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1) rotate(0)'}
      aria-hidden>
        <div>{score}</div>
        <div style={{fontSize: 12, marginTop: 4}}>{scoreLabel}</div>
      </div>
      <div style={{flex: 1}}>
        <div style={{marginBottom: 12, display: 'flex', gap: 20}}>
          <div style={{padding: '8px 12px', background: 'rgba(214,167,122,0.1)', borderRadius: 6}}>
            <strong style={{color: 'var(--light-mocha)'}}>📊 Rows:</strong> <span>{rowCount}</span>
          </div>
          <div style={{padding: '8px 12px', background: 'rgba(214,167,122,0.1)', borderRadius: 6}}>
            <strong style={{color: 'var(--light-mocha)'}}>📋 Columns:</strong> <span>{columnCount}</span>
          </div>
        </div>
        <div style={{padding: '8px 12px', background: 'rgba(255,140,130,0.1)', borderRadius: 6}}>
          <strong style={{color: 'var(--light-mocha)'}}>⚠️ Duplicates:</strong> <span>{duplicates}</span>
        </div>
      </div>
    </div>
  )
}
