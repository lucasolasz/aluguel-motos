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

export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function horaToMinutes(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export function horariosRetiradaValidos(retiradaDate: Date | undefined): string[] {
  const all = gerarHorariosReserva()
  if (!retiradaDate) return all
  if (!isSameDay(retiradaDate, new Date())) return all
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return all.filter((slot) => horaToMinutes(slot) > nowMinutes)
}

export function horariosDevolucaoValidos(
  retiradaDate: Date | undefined,
  retiradaHora: string,
  devolucaoDate: Date | undefined,
): string[] {
  const all = gerarHorariosReserva()
  if (!retiradaDate || !devolucaoDate) return all
  if (!isSameDay(retiradaDate, devolucaoDate)) return all
  if (!retiradaHora) return []
  const min = horaToMinutes(retiradaHora) + 60
  return all.filter((slot) => horaToMinutes(slot) >= min)
}