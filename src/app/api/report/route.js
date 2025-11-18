import Papa from 'papaparse'

export async function POST(req) {
  try {
    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'json'
    const body = await req.json()
    const { analysis, data } = body || {}

    if (!analysis) {
      return new Response(JSON.stringify({ error: 'analysis required' }), { status: 400 })
    }

    if (format === 'csv') {
      // data -> CSV. If data undefined, return analysis only as JSON
      const csv = data ? Papa.unparse(data) : Papa.unparse([])
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="analysis-data.csv"'
        }
      })
    }

    // default: return JSON report with analysis and (optionally) data
    const payload = { analysis, data }
    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="analysis-report.json"'
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
