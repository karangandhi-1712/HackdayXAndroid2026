/**
 * Ninja REST API Client for Vue 3
 * Configured for remote API hosting with API Key authentication.
 */

export const DEFAULT_API_BASE = import.meta.env.VITE_NINJA_API_URL || ''
export const DEFAULT_API_KEY = import.meta.env.VITE_NINJA_API_KEY || ''

/**
 * Check if the remote Ninja backend is reachable and responsive
 */
export async function checkNinjaHealth(apiBase = DEFAULT_API_BASE, apiKey = DEFAULT_API_KEY) {
  try {
    const base = (apiBase || '').replace(/\/$/, '')
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 4000)

    const headers = {}
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`
      headers['X-API-Key'] = apiKey.trim()
    }

    const healthUrl = base ? `${base}/healthz` : '/healthz'
    const healthRes = await fetch(healthUrl, {
      signal: controller.signal,
      headers,
    })
    clearTimeout(id)

    if (!healthRes.ok) {
      return { alive: false, ready: false, error: `HTTP ${healthRes.status} (${healthRes.statusText})` }
    }

    const readyUrl = base ? `${base}/readyz` : '/readyz'
    const readyRes = await fetch(readyUrl, { headers }).catch(() => null)
    return {
      alive: true,
      ready: readyRes ? readyRes.ok : false,
      error: null,
    }
  } catch (err) {
    return {
      alive: false,
      ready: false,
      error: err.name === 'AbortError' ? 'Connection timed out' : (err.message || 'Remote server unreachable'),
    }
  }
}

/**
 * Send an email to the Ninja REST API for scam and threat classification
 */
export async function analyzeEmail(payload, options = {}) {
  const {
    apiBase = DEFAULT_API_BASE,
    apiKey = DEFAULT_API_KEY,
    isAsync = false,
  } = options

  const base = (apiBase || '').replace(/\/$/, '')
  const endpoint = base ? `${base}/v1/analyze` : '/v1/analyze'
  const url = `${endpoint}${isAsync ? '?wait=false' : ''}`

  let headers = {}
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`
    headers['X-API-Key'] = apiKey.trim()
  }

  let body

  if (payload instanceof File) {
    const formData = new FormData()
    formData.append('file', payload, payload.name)
    body = formData
    // Browser automatically populates multipart/form-data boundary
  } else if (typeof payload === 'string') {
    headers['Content-Type'] = 'message/rfc822'
    body = payload
  } else {
    throw new Error('Unsupported payload format. Expected raw email string or File.')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  })

  if (!response.ok) {
    let errorDetail = `Status ${response.status} (${response.statusText})`
    try {
      const errJson = await response.json()
      if (errJson && errJson.error) {
        errorDetail = errJson.error
      }
    } catch {
      // Non-JSON response
    }
    throw new Error(`Ninja API Error: ${errorDetail}`)
  }

  return await response.json()
}

/**
 * Format headers and body into standard RFC-822 email format
 */
export function buildRFC822(from, to, subject, body, extraHeaders = {}) {
  const dateStr = new Date().toUTCString()
  const msgId = `<ninja.${Date.now()}.${Math.random().toString(36).substring(2, 9)}@remote.client>`

  let headerLines = [
    `From: ${from.trim() || 'sender@example.com'}`,
    `To: ${to.trim() || 'recipient@example.com'}`,
    `Subject: ${subject.trim() || 'No Subject'}`,
    `Date: ${dateStr}`,
    `Message-ID: ${msgId}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
  ]

  for (const [key, value] of Object.entries(extraHeaders)) {
    if (value) headerLines.push(`${key}: ${value}`)
  }

  return `${headerLines.join('\r\n')}\r\n\r\n${body}`
}
