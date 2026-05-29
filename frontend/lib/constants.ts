export const MARCAS = [
  'Avelloz',
  'Bajaj',
  'BMW',
  'CFMOTO',
  'Dafra',
  'Ducati',
  'Harley-Davidson',
  'Haojue',
  'Honda',
  'Kawasaki',
  'KTM',
  'Kymco',
  'Mottu',
  'Royal Enfield',
  'Shineray',
  'Suzuki',
  'Triumph',
  'Vmoto',
  'Voge',
  'Voltz',
  'Yamaha',
  'Zontes',
]

export const TRANSMISSOES = [
  'Manual',
  'Semiautomático',
  'CVT automático',
  'Automatizado (DCT/AMT)',
  'Embreagem eletrônica',
  'Monomarcha elétrica',
]

export function generateYears(from = 1900, to = 2100): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => to - i)
}

export const ANOS = generateYears()
