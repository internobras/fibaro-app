const FUNCTION_NAME = 'meta-conversions'
const META_API_VERSION = 'v26.0'
const ALLOWED_ORIGINS = new Set([
  'https://fibaroteleco.com',
  'https://www.fibaroteleco.com',
])
const REFERENCE_PATTERN = /^FB-\d{6}-[A-F0-9]{6}$/
const FBP_PATTERN = /^fb\.1\.\d{10,16}\.[A-Za-z0-9_-]{1,200}$/
const FBC_PATTERN = /^fb\.1\.\d{10,16}\.[A-Za-z0-9_-]{1,240}$/

type Input = {
  event_name?: unknown
  event_id?: unknown
  event_source_url?: unknown
  marketing_consent?: unknown
  fbp?: unknown
  fbc?: unknown
  test_event_code?: unknown
}

type ErrorFields = {
  message?: unknown
  code?: unknown
  details?: unknown
  hint?: unknown
  status?: unknown
}

class RequestError extends Error {
  status: number
  code: string | null
  details: string | null
  hint: string | null

  constructor(message: string, status: number, fields: ErrorFields = {}) {
    super(message)
    this.name = 'RequestError'
    this.status = status
    this.code = safeString(fields.code)
    this.details = safeString(fields.details)
    this.hint = safeString(fields.hint)
  }
}

function safeString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://fibaroteleco.com',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

function json(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function logError(operation: string, error: unknown) {
  const value = typeof error === 'object' && error !== null ? error as ErrorFields : {}
  console.error(`${FUNCTION_NAME} ${operation} error`, JSON.stringify({
    function: FUNCTION_NAME,
    operation,
    message: error instanceof Error ? error.message : safeString(value.message) ?? 'Error desconocido.',
    code: safeString(value.code),
    details: safeString(value.details),
    hint: safeString(value.hint),
    status: typeof value.status === 'number' ? value.status : null,
    timestamp: new Date().toISOString(),
  }))
}

function getDefaultSecretKey(): string {
  const rawKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (!rawKeys) throw new RequestError('SUPABASE_SECRET_KEYS no está disponible.', 503)
  let keys: unknown
  try {
    keys = JSON.parse(rawKeys)
  } catch {
    throw new RequestError('SUPABASE_SECRET_KEYS no contiene JSON válido.', 503)
  }
  if (typeof keys !== 'object' || keys === null || !('default' in keys) || typeof keys.default !== 'string' || !keys.default) {
    throw new RequestError('SUPABASE_SECRET_KEYS.default no está disponible.', 503)
  }
  return keys.default
}

function requiredSecret(name: 'META_CONVERSIONS_ACCESS_TOKEN' | 'META_PIXEL_ID') {
  const value = Deno.env.get(name)
  if (!value) throw new RequestError(`${name} no está configurado.`, 503)
  return value
}

function requestIp(req: Request) {
  return (req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0] || '').trim().slice(0, 100)
}

function parseInput(value: unknown): Required<Pick<Input, 'event_name' | 'event_id' | 'event_source_url' | 'marketing_consent'>> & Input {
  if (typeof value !== 'object' || value === null) throw new RequestError('El cuerpo JSON no es válido.', 400)
  const input = value as Input
  if (input.event_name !== 'Lead') throw new RequestError('Evento no permitido.', 400)
  if (input.marketing_consent !== true) throw new RequestError('No existe consentimiento de marketing.', 403)
  if (typeof input.event_id !== 'string' || !REFERENCE_PATTERN.test(input.event_id)) throw new RequestError('event_id no válido.', 400)
  if (typeof input.event_source_url !== 'string') throw new RequestError('event_source_url no válido.', 400)
  let source: URL
  try {
    source = new URL(input.event_source_url)
  } catch {
    throw new RequestError('event_source_url no válido.', 400)
  }
  if (source.protocol !== 'https:' || !ALLOWED_ORIGINS.has(source.origin)) throw new RequestError('Origen del evento no permitido.', 403)
  return input as Required<Pick<Input, 'event_name' | 'event_id' | 'event_source_url' | 'marketing_consent'>> & Input
}

async function assertRecentLead(baseUrl: string, secretKey: string, eventId: string) {
  const url = new URL('/rest/v1/leads', baseUrl)
  url.searchParams.set('select', 'id')
  url.searchParams.set('reference', `eq.${eventId}`)
  url.searchParams.set('created_at', `gte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`)
  url.searchParams.set('limit', '1')
  const response = await fetch(url, { headers: { apikey: secretKey, Accept: 'application/json' } })
  if (!response.ok) {
    let fields: ErrorFields = {}
    try { fields = await response.json() as ErrorFields } catch { /* status is sufficient */ }
    throw new RequestError(safeString(fields.message) ?? 'No se pudo verificar el lead.', response.status, fields)
  }
  const rows = await response.json() as Array<{ id: string }>
  if (!rows.length) throw new RequestError('No existe un lead reciente para event_id.', 404)
}

async function sendConversion(req: Request, input: ReturnType<typeof parseInput>) {
  const baseUrl = Deno.env.get('SUPABASE_URL')
  if (!baseUrl) throw new RequestError('SUPABASE_URL no está disponible.', 503)
  const secretKey = getDefaultSecretKey()
  const accessToken = requiredSecret('META_CONVERSIONS_ACCESS_TOKEN')
  const pixelId = requiredSecret('META_PIXEL_ID')
  await assertRecentLead(baseUrl, secretKey, input.event_id as string)

  const userData: Record<string, string> = {}
  const ip = requestIp(req)
  const userAgent = (req.headers.get('user-agent') || '').trim().slice(0, 1000)
  if (ip) userData.client_ip_address = ip
  if (userAgent) userData.client_user_agent = userAgent
  if (typeof input.fbp === 'string' && FBP_PATTERN.test(input.fbp)) userData.fbp = input.fbp
  if (typeof input.fbc === 'string' && FBC_PATTERN.test(input.fbc)) userData.fbc = input.fbc

  const payload: Record<string, unknown> = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.event_id,
      action_source: 'website',
      event_source_url: input.event_source_url,
      user_data: userData,
    }],
  }
  if (typeof input.test_event_code === 'string' && /^TEST\d{3,20}$/.test(input.test_event_code)) {
    payload.test_event_code = input.test_event_code
  }

  const endpoint = new URL(`https://graph.facebook.com/${META_API_VERSION}/${encodeURIComponent(pixelId)}/events`)
  endpoint.searchParams.set('access_token', accessToken)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  let result: Record<string, unknown> = {}
  try { result = await response.json() as Record<string, unknown> } catch { /* status is sufficient */ }
  if (!response.ok || typeof result.events_received !== 'number' || result.events_received < 1) {
    const metaError = typeof result.error === 'object' && result.error !== null ? result.error as ErrorFields : {}
    throw new RequestError(safeString(metaError.message) ?? 'Meta rechazó el evento.', response.status, metaError)
  }
  console.info(`${FUNCTION_NAME} lead sent`, JSON.stringify({
    function: FUNCTION_NAME,
    operation: 'send_lead',
    event_name: 'Lead',
    event_id: input.event_id,
    status: response.status,
    events_received: result.events_received,
    timestamp: new Date().toISOString(),
  }))
  return { ok: true, event_id: input.event_id, events_received: result.events_received }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') || ''
  if (req.method === 'OPTIONS') {
    if (!ALLOWED_ORIGINS.has(origin)) return json({ ok: false, error: 'Origen no permitido.' }, 403, origin)
    return new Response(null, { status: 204, headers: cors(origin) })
  }
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido.' }, 405, origin)
  if (!ALLOWED_ORIGINS.has(origin)) return json({ ok: false, error: 'Origen no permitido.' }, 403, origin)

  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.toLowerCase().startsWith('application/json')) throw new RequestError('Content-Type no permitido.', 415)
    const input = parseInput(await req.json())
    return json(await sendConversion(req, input), 200, origin)
  } catch (error) {
    const status = error instanceof RequestError ? error.status : 500
    logError(status >= 500 ? 'send_lead' : 'validate_request', error)
    const message = status >= 500 ? 'No se pudo registrar la conversión.' : error instanceof Error ? error.message : 'Solicitud no válida.'
    return json({ ok: false, error: message }, status, origin)
  }
})
