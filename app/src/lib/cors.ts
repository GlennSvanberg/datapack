/** Headers htmx may send on cross-origin embed requests (GET + POST). */
const HTMX_REQUEST_HEADERS =
  'HX-Request, HX-Trigger, HX-Trigger-Name, HX-Target, HX-Current-URL, HX-Boosted, HX-Prompt, HX-History-Restore-Request'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': `Content-Type, ${HTMX_REQUEST_HEADERS}`,
} as const

export function withCors(headers: HeadersInit = {}): HeadersInit {
  return { ...CORS_HEADERS, ...headers }
}

export function corsPreflightResponse(): Response {
  return new Response(null, { status: 204, headers: withCors() })
}
