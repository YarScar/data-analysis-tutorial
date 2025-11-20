import OpenAI from 'openai'

// Simple in-memory cache to reduce repeated OpenAI calls during a session
const aiCache = new Map()

export async function POST(req) {
  try {
    const body = await req.json()
    const { analysis, sample, column } = body || {}

    const key = process.env.OPENAI_API_KEY
    if (!key) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured on server' }), { status: 400 })
    }

    const client = new OpenAI({ apiKey: key })

    // Build a deterministic cache key for this request
    const cacheKey = JSON.stringify({ analysis, column, sampleLength: (sample || []).length })
    if (aiCache.has(cacheKey)) {
      return new Response(JSON.stringify({ cached: true, ...aiCache.get(cacheKey) }), { status: 200 })
    }

    // Stronger prompt asking for strict JSON output. Include severity levels in recommendations.
    let prompt = `You are a data quality assistant. Given an analysis summary and a small sample, produce a strict JSON object only (no surrounding explanation) that follows this schema:\n` +
      `{"summary": string, "recommendations": [{"step": string, "severity": "low|medium|high"}], "notes"?: string }` +
      `\nIf a recommendation applies to a specific column, include the column name in the step text. Keep summary to one short paragraph. Keep recommendations concise (1-2 short sentences each).`
    if (column) {
      prompt += ` Focus your recommendations on the column: ${column}.`
    }
    prompt += `\n\nNow provide the JSON only. Do not include any commentary.`

    // Add a couple of short few-shot examples to encourage consistent JSON output
    prompt += `\n\nExample 1:\nUser input: small analysis with missingness on columns 'age' and 'email'\nResponse JSON:\n` +
      `{"summary":"Dataset has some missing ages and many missing emails; overall numeric columns look okay.","recommendations":[{"step":"For column 'email', remove rows where email is null or apply an imputation strategy.","severity":"medium"},{"step":"For column 'age', check for outliers >120 and replace with null.","severity":"low"}],"notes":"Phone numbers appear consistent."}`

    prompt += `\n\nExample 2 (column-focused):\nUser input: focus on column 'price' with many zeros and some negative values.\nResponse JSON:\n` +
      `{"summary":"'price' contains zeros and negative values suggesting data-entry issues.","recommendations":[{"step":"Filter out negative prices and investigate source rows for incorrect sign.","severity":"high"},{"step":"Treat zero prices as missing if business rules allow, or verify with source.","severity":"medium"}],"notes":"Consider currency normalization."}`

    prompt += `\n\nAnalysis:\n${JSON.stringify(analysis, null, 2)}\n\nSample (first rows):\n${JSON.stringify(sample || [], null, 2)}`

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    })

    const text = resp.choices?.[0]?.message?.content || JSON.stringify(resp)
    // try to parse JSON from the model output
    let parsed = null
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      // try to extract JSON substring
      const m = text.match(/\{[\s\S]*\}/)
      if (m) {
        try { parsed = JSON.parse(m[0]) } catch (_) { parsed = null }
      }
    }
    const out = { text, parsed }
    // cache successful parsed responses (or even raw text)
    aiCache.set(cacheKey, out)
    return new Response(JSON.stringify(out), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
