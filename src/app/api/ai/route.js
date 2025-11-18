import OpenAI from 'openai'

export async function POST(req) {
  try {
    const body = await req.json()
    const { analysis, sample } = body || {}

    const key = process.env.OPENAI_API_KEY
    if (!key) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured on server' }), { status: 400 })
    }

    const client = new OpenAI({ apiKey: key })

    const prompt = `You are a data quality assistant. Given the analysis summary and a small sample, provide human-friendly insights and recommended cleaning steps.\n\nAnalysis:\n${JSON.stringify(analysis, null, 2)}\n\nSample:\n${JSON.stringify(sample, null, 2)}`

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    })

    const text = resp.choices?.[0]?.message?.content || JSON.stringify(resp)
    return new Response(JSON.stringify({ text }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
