import {
  previewIngest,
  parseUploadToRawSheets,
  parseUploadToSheets,
  suggestSchemaFromSheet,
  detectCsvDelimiter,
} from '@shared/ingest/index'
import type { IngestConfig, SchemaField } from '@shared/manifest.types'

export async function parseFilePreview(
  buffer: ArrayBuffer,
  fileName: string,
  ingestConfig?: IngestConfig,
  schema?: SchemaField[],
) {
  const partialConfig = ingestConfig
    ? { csvDelimiter: ingestConfig.csvDelimiter }
    : undefined
  const rawSheets = await parseUploadToRawSheets(buffer, fileName, partialConfig)
  const sheets = await parseUploadToSheets(buffer, fileName, ingestConfig)
  const primary = sheets[0]

  const lower = fileName.toLowerCase()
  let detectedCsvDelimiter: string | undefined
  if (lower.endsWith('.csv')) {
    const text = new TextDecoder('utf-8').decode(buffer)
    detectedCsvDelimiter =
      ingestConfig?.csvDelimiter ?? detectCsvDelimiter(text.slice(0, 4096))
  }

  if (!ingestConfig || !schema) {
    return {
      sheets: sheets.map((s) => {
        const raw = rawSheets.find((r) => r.name === s.name)
        return {
          name: s.name,
          headers: s.headers,
          rowCount: s.rows.length,
          sampleRows: s.rows.slice(0, 5),
          rawPreviewRows: (raw?.rows ?? []).slice(0, 8),
          headerRowIndex: 0,
        }
      }),
      suggestedSchema: primary ? suggestSchemaFromSheet(primary) : [],
      previewRecords: [],
      warnings: [] as string[],
      detectedCsvDelimiter,
    }
  }

  return await previewIngest(buffer, fileName, ingestConfig, schema)
}

export function bufferFromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function readUploadBuffer(request: Request): Promise<{
  buffer: ArrayBuffer
  fileName: string
}> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      throw new Error('Missing file in form data')
    }
    return { buffer: await file.arrayBuffer(), fileName: file.name }
  }

  const body = (await request.json()) as {
    fileBase64?: string
    fileName?: string
  }
  if (!body.fileBase64 || !body.fileName) {
    throw new Error('Expected fileBase64 and fileName in JSON body')
  }
  return {
    buffer: bufferFromBase64(body.fileBase64),
    fileName: body.fileName,
  }
}
