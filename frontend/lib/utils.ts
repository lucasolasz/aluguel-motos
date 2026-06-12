import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const str = typeof date === 'string' ? date : date.toISOString()
  const normalized = str.includes('T') ? str : str + 'T00:00:00'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(normalized))
}

/** Timestamp ddMMyyyyHHmmss (dia mês ano hora minuto segundo) para nomear pastas/arquivos no bucket. */
export function formatBucketTimestamp(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    pad(d.getDate()) +
    pad(d.getMonth() + 1) +
    d.getFullYear() +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  )
}
