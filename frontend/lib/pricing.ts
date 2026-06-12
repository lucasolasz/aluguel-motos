export interface DescontoTierItem {
  id?: string
  min: number
  max: number
  desconto: number
  ordem: number
}

export interface PrecificacaoConfig {
  id: string
  janeiro: number
  fevereiro: number
  marco: number
  abril: number
  maio: number
  junho: number
  julho: number
  agosto: number
  setembro: number
  outubro: number
  novembro: number
  dezembro: number
  carnavalInicioMes: number
  carnavalInicioDia: number
  carnavalFimMes: number
  carnavalFimDia: number
  carnavalFator: number
  descontoTiers: DescontoTierItem[]
}

export interface PrecificacaoConfigRequest {
  janeiro: number
  fevereiro: number
  marco: number
  abril: number
  maio: number
  junho: number
  julho: number
  agosto: number
  setembro: number
  outubro: number
  novembro: number
  dezembro: number
  carnavalInicioMes: number
  carnavalInicioDia: number
  carnavalFimMes: number
  carnavalFimDia: number
  carnavalFator: number
  descontoTiers: Omit<DescontoTierItem, 'id'>[]
}

const DEFAULTS: PrecificacaoConfig = {
  id: '',
  janeiro: 1.0,
  fevereiro: 1.0,
  marco: 1.0,
  abril: 1.0,
  maio: 1.0,
  junho: 1.0,
  julho: 0.75,
  agosto: 1.0,
  setembro: 1.0,
  outubro: 1.0,
  novembro: 1.0,
  dezembro: 1.25,
  carnavalInicioMes: 2,
  carnavalInicioDia: 10,
  carnavalFimMes: 2,
  carnavalFimDia: 17,
  carnavalFator: 1.40,
  descontoTiers: [
    { min: 1, max: 2, desconto: 0, ordem: 0 },
    { min: 3, max: 4, desconto: 10, ordem: 1 },
    { min: 5, max: 7, desconto: 20, ordem: 2 },
    { min: 8, max: 999, desconto: 30, ordem: 3 },
  ],
}

export function fatorDesconto(dias: number, config: PrecificacaoConfig): number {
  const tier = config.descontoTiers.find(t => dias >= t.min && dias <= t.max)
  if (!tier) return 1
  return 1 - tier.desconto / 100
}

export function fatorSazonal(dataRetirada: Date, config: PrecificacaoConfig): number {
  const mes = dataRetirada.getMonth() + 1
  const dia = dataRetirada.getDate()

  if (
    (mes === config.carnavalInicioMes && dia >= config.carnavalInicioDia) ||
    (mes === config.carnavalFimMes && dia <= config.carnavalFimDia)
  ) {
    if (config.carnavalInicioMes === config.carnavalFimMes) {
      if (mes === config.carnavalInicioMes && dia >= config.carnavalInicioDia && dia <= config.carnavalFimDia) {
        return config.carnavalFator
      }
    } else {
      if (
        (mes === config.carnavalInicioMes && dia >= config.carnavalInicioDia) ||
        (mes === config.carnavalFimMes && dia <= config.carnavalFimDia)
      ) {
        return config.carnavalFator
      }
    }
  }

  const fatores = [
    config.janeiro, config.fevereiro, config.marco, config.abril,
    config.maio, config.junho, config.julho, config.agosto,
    config.setembro, config.outubro, config.novembro, config.dezembro,
  ]
  return fatores[mes - 1] ?? 1
}

export type TipoQuilometragem = 'economica' | 'ilimitada'

export function calcularDiariaEfetiva(
  precoBase: number,
  dias: number,
  dataRetirada: Date,
  tipo: TipoQuilometragem,
  config: PrecificacaoConfig,
): number {
  let diaria = precoBase * fatorDesconto(dias, config) * fatorSazonal(dataRetirada, config)
  if (tipo === 'ilimitada') {
    diaria *= 1.25
  }
  return Math.round(diaria * 100) / 100
}

export function getDefaultConfig(): PrecificacaoConfig {
  return { ...DEFAULTS, descontoTiers: DEFAULTS.descontoTiers.map(t => ({ ...t })) }
}
