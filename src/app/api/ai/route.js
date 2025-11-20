import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

// Simple in-memory cache to reduce repeated OpenAI calls during a session
const aiCache = new Map()
const LOG_DIR = path.resolve(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'ai.log')

async function ensureLogDir() {
  try {
    await fs.promises.mkdir(LOG_DIR, { recursive: true })
  } catch (e) {
    // ignore
  }
}

async function logParseFailure(info) {
  try {
    await ensureLogDir()
    const entry = `[${new Date().toISOString()}] ${JSON.stringify(info)}\n`
    await fs.promises.appendFile(LOG_FILE, entry, 'utf8')
  } catch (e) {
    // swallow logging errors to avoid impacting the API
    console.error('Failed to write AI parse log:', e)
  }
}

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

    // Helper: validate parsed JSON against expected shape and normalize recommendations
    function validateAndNormalize(parsed) {
      if (!parsed || typeof parsed !== 'object') return { valid: false, reason: 'not_object' }
      const { summary, recommendations, notes } = parsed
      if (!summary || typeof summary !== 'string') return { valid: false, reason: 'missing_summary' }
      if (!Array.isArray(recommendations)) return { valid: false, reason: 'missing_recommendations' }
      const normRecs = []
      for (const r of recommendations) {
        if (typeof r === 'string') {
          normRecs.push({ step: r, severity: 'medium' })
          continue
        }
        if (r && typeof r === 'object' && typeof r.step === 'string') {
          const sev = typeof r.severity === 'string' ? r.severity.toLowerCase() : 'medium'
          normRecs.push({ step: r.step, severity: ['low','medium','high'].includes(sev) ? sev : 'medium' })
          continue
        }
        return { valid: false, reason: 'invalid_recommendation_item' }
      }
      const normalized = { summary, recommendations: normRecs }
      if (notes && typeof notes === 'string') normalized.notes = notes
      return { valid: true, normalized }
    }

    // Try up to maxAttempts to get a valid JSON response from the model
    const maxAttempts = 3
    let attempts = 0
    let finalText = null
    let finalParsed = null
    let finalNormalized = null

    while (attempts < maxAttempts) {
      attempts++
      const resp = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      })
      const text = resp.choices?.[0]?.message?.content || JSON.stringify(resp)
      // attempt parse
      let parsed = null
      try {
        parsed = JSON.parse(text)
      } catch (e) {
        const m = text.match(/\{[\s\S]*\}/)
        if (m) {
          try { parsed = JSON.parse(m[0]) } catch (_) { parsed = null }
        }
      }

      const validation = validateAndNormalize(parsed)
      if (validation.valid) {
        finalText = text
        finalParsed = parsed
        finalNormalized = validation.normalized
        break
      }

      // Log parse/validation failure for tuning
      try {
        await logParseFailure({ cacheKey, attempt: attempts, reason: validation.reason || 'invalid', textSnippet: (text || '').slice(0, 2000) })
      } catch (e) {
        // swallow
      }

      // If not valid and we have attempts remaining, build a short follow-up prompt asking for strict JSON only
      if (attempts < maxAttempts) {
        prompt = `The previous response was not valid JSON matching the required schema. Please return ONLY a JSON object that follows this schema:\n` +
          `{"summary": string, "recommendations": [{"step": string, "severity": "low|medium|high"}], "notes"?: string }` +
          `\nDo not include any extra commentary. Previous model output was:\n${text}\n\nAnalysis:\n${JSON.stringify(analysis, null, 2)}\nSample:\n${JSON.stringify(sample || [], null, 2)}`
        // loop to retry
        continue
      } else {
        // no attempts left, return best-effort parsed or raw text
        finalText = text
        finalParsed = parsed
        finalNormalized = validation.normalized || null
        // log final failure if we didn't normalize
        try {
          if (!finalNormalized) await logParseFailure({ cacheKey, attempt: attempts, reason: 'final_failed', textSnippet: (finalText || '').slice(0, 2000) })
        } catch (e) {}
        break
      }
    }

    const out = { attempts, text: finalText, parsed: finalParsed, normalized: finalNormalized }
    // cache only when we have a normalized valid response, otherwise cache raw text minimally
    if (finalNormalized) aiCache.set(cacheKey, out)
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
