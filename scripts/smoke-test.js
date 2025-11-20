/* Simple smoke test: POST to local /api/ai with a sample analysis.

Run: npm run smoke-test  (ensure dev server is running on http://localhost:3000)
*/

async function run() {
  const payload = {
    analysis: {
      summary: 'small test analysis',
      missingness: { age: 10, email: 50 },
      columnStats: { age: { type: 'number' }, email: { type: 'string' } }
    },
    sample: [{ age: 25, email: 'a@example.com' }, { age: null, email: null }],
    column: null
  }

  // Try common ports if the dev server moved from 3000 -> 3001
  const ports = [process.env.PORT || 3000, 3001]
  let lastErr = null
  for (const p of ports) {
    const url = `http://localhost:${p}/api/ai`
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const text = await res.text()
      console.log('URL:', url)
      console.log('Status:', res.status)
      try {
        const json = JSON.parse(text)
        console.log(JSON.stringify(json, null, 2))
      } catch (e) {
        console.log('Response body (text):')
        console.log(text)
      }
      return
    } catch (err) {
      lastErr = err
    }
  }
  console.error('Failed to contact /api/ai on ports tried; last error:', lastErr)
  process.exit(1)
}

run()
