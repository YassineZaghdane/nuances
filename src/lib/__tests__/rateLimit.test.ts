import { rateLimit } from '../rateLimit'

describe('rateLimit', () => {
  it('autorise les premières requêtes', () => {
    expect(rateLimit('test-ip-1', 5, 60000)).toBe(true)
    expect(rateLimit('test-ip-1', 5, 60000)).toBe(true)
  })

  it('bloque après la limite', () => {
    const ip = 'test-ip-block'
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, 5, 60000)
    }
    expect(rateLimit(ip, 5, 60000)).toBe(false)
  })

  it('isole les IPs différentes', () => {
    const ip1 = 'unique-ip-a'
    const ip2 = 'unique-ip-b'
    for (let i = 0; i < 5; i++) rateLimit(ip1, 5, 60000)
    expect(rateLimit(ip1, 5, 60000)).toBe(false)
    expect(rateLimit(ip2, 5, 60000)).toBe(true)
  })

  it('réinitialise après la fenêtre temporelle', async () => {
    const ip = 'test-ip-reset'
    rateLimit(ip, 1, 50)   // 1 req max sur 50ms
    rateLimit(ip, 1, 50)   // bloqué
    expect(rateLimit(ip, 1, 50)).toBe(false)
    await new Promise((r) => setTimeout(r, 100))  // attendre la fin de fenêtre
    expect(rateLimit(ip, 1, 50)).toBe(true)
  })
})
