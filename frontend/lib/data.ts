export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const str = typeof date === 'string' ? date : date.toISOString()
  const normalized = str.includes('T') ? str : str + 'T00:00:00'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(normalized))
}