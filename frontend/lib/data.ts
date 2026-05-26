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

export function gerarHorariosReserva(): string[] {
  const slots: string[] = []
  for (let h = 6; h <= 23; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 23) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}