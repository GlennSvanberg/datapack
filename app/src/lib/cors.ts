const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const

export function withCors(headers: HeadersInit = {}): HeadersInit {
  return { ...CORS_HEADERS, ...headers }
}

export function corsPreflightResponse(): Response {
  return new Response(null, { status: 204, headers: withCors() })
}
