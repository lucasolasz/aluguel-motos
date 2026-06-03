const isDev = process.env.NODE_ENV === 'development'

export function logError(...args: unknown[]): void {
  if (isDev) console.error(...args)
}
