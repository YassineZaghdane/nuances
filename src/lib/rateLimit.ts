/**
 * @module rateLimit
 * @description Limitation de débit en mémoire (par IP)
 */
const requests = new Map<string, { count: number; reset: number }>()

export function rateLimit(
  ip: string,
  limit = 20,
  windowMs = 60000
): boolean {
  const now = Date.now()
  const entry = requests.get(ip)
  if (!entry || now > entry.reset) {
    requests.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}
