/**
 * Generate a unique Transaction ID in format SYR-YYYYMMDD-XXXXXX
 */
export function generateTransactionId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let random = ''
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `SYR-${date}-${random}`
}

/**
 * Format price to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Validate Indonesian phone number (08xx or 62xx)
 */
export function isValidPhone(phone: string): boolean {
  return /^(08|62)\d{8,12}$/.test(phone.replace(/\s|-/g, ''))
}

/**
 * Simple fuzzy search: check if query matches text
 */
export function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase()
  const q = query.toLowerCase().trim()
  if (!q) return true
  return t.includes(q)
}

/**
 * Debounce helper (returns a debounced version of fn)
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}
