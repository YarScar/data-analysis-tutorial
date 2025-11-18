import * as XLSX from 'xlsx'
import { normalizeRow } from '../../../lib/fileProcessing'

export async function POST(req) {
  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!file) {
      return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })
    }

    // read as array buffer
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheet = workbook.SheetNames[0]
    const sheet = workbook.Sheets[firstSheet]
    const json = XLSX.utils.sheet_to_json(sheet, { defval: null })
    const normalized = json.map(normalizeRow)

    return new Response(JSON.stringify({ data: normalized }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
