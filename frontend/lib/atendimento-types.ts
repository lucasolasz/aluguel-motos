// Tipos do atendimento presencial (retirada / devolução) — espelham os DTOs do
// backend: ReservaDetalheDTO, ReservaAdminDTO, PagamentoDTO, VistoriaDTO, ContratoDTO.

export type StatusReserva =
  | 'PENDENTE'
  | 'CONFIRMADA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'CANCELADA'

export type NivelCombustivel =
  | 'VAZIO'
  | 'UM_QUARTO'
  | 'METADE'
  | 'TRES_QUARTOS'
  | 'CHEIO'

export type TipoVistoria = 'SAIDA' | 'RETORNO'
export type TipoPagamento = 'ALUGUEL' | 'CAUCAO'
export type StatusPagamento =
  | 'PENDENTE'
  | 'PAGO'
  | 'AUTORIZADO'
  | 'LIBERADO'
  | 'CAPTURADO'
  | 'ESTORNADO'
  | 'FALHOU'
export type TipoAssinatura = 'MANUAL' | 'DIGITAL'

export interface LocalResumoAdmin {
  id: string
  nome: string
  cidade: string
  estado: string
}

export interface AdminReservaResumo {
  id: string
  status: StatusReserva
  dataRetirada: string
  dataDevolucao: string
  horaRetirada: string | null
  horaDevolucao: string | null
  localRetirada: LocalResumoAdmin | null
  localDevolucao: LocalResumoAdmin | null
  totalDias: number
  moto: { id: string; nome: string; imagens: string[] }
  cliente: { id: string; nome: string | null; email: string }
  precoPorDia: number
  caucao: number
  totalAluguel: number
  totalSeguro: number
  totalAcessorios: number
  totalLavagem: number
  total: number
  cartaoNumeroMascarado: string | null
  createdAt: string
}

export interface ClienteDetalhe {
  id: string
  nomeCompleto: string | null
  email: string
  cpf: string | null
  ddi: string | null
  ddd: string | null
  numero: string | null
}

export interface CnhDetalhe {
  rg: string
  numeroRegistro: string
  numeroCnh: string
  dataNascimento: string
  dataValidade: string
  estado: string
  vencida: boolean
}

export interface Pagamento {
  id: string
  tipo: TipoPagamento
  status: StatusPagamento
  valor: number
  gatewayTransactionId: string | null
  metodo: string | null
  createdAt: string
}

export interface VistoriaFoto {
  id: string
  url: string
  ordem: number
}

export interface Vistoria {
  id: string
  tipo: TipoVistoria
  kmRegistrado: number | null
  nivelCombustivel: NivelCombustivel | null
  observacoes: string | null
  fotos: VistoriaFoto[]
  createdAt: string
}

export interface Contrato {
  id: string
  tipoAssinatura: TipoAssinatura | null
  urlDocumento: string | null
  assinaturaUrl: string | null
  assinadoEm: string | null
  createdAt: string
}

export interface ReservaDetalhe {
  reserva: AdminReservaResumo
  cliente: ClienteDetalhe
  cnh: CnhDetalhe | null
  cnhVerificada: boolean
  cnhVerificadaPor: string | null
  cnhVerificadaEm: string | null
  retiradaConcluidaEm: string | null
  devolucaoConcluidaEm: string | null
  motoKmAtual: number | null
  pagamentos: Pagamento[]
  vistorias: Vistoria[]
  contrato: Contrato | null
  multas: Multa[]
}

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface CriarVistoriaPayload {
  tipo: TipoVistoria
  kmRegistrado?: number | null
  nivelCombustivel?: NivelCombustivel | null
  observacoes?: string | null
  fotos: string[]
}

export interface SalvarContratoPayload {
  tipoAssinatura: TipoAssinatura
  urlDocumento?: string | null
  assinaturaUrl?: string | null
}

export interface ConcluirDevolucaoPayload {
  valorDescontoCaucao?: number | null
  observacoes?: string | null
}

export const NIVEL_COMBUSTIVEL_LABELS: Record<NivelCombustivel, string> = {
  VAZIO: 'Vazio',
  UM_QUARTO: '1/4',
  METADE: '1/2',
  TRES_QUARTOS: '3/4',
  CHEIO: 'Cheio',
}

// ─── Multas ──────────────────────────────────────────────────────────────────

export type TipoMulta = 'AVARIA' | 'ATRASO' | 'COMBUSTIVEL_FALTANTE' | 'LIMPEZA' | 'OUTROS'
export type StatusMulta = 'PENDENTE' | 'COBRADA' | 'CANCELADA'

export interface Multa {
  id: string
  reservaId: string
  tipo: TipoMulta
  status: StatusMulta
  descricao: string
  observacoes: string | null
  valor: number
  criadoPor: string | null
  createdAt: string
}

export interface CriarMultaPayload {
  tipo: TipoMulta
  descricao: string
  valor: number
  observacoes?: string
}

export interface EditarMultaPayload {
  tipo?: TipoMulta
  descricao?: string
  valor?: number
  observacoes?: string
  status?: StatusMulta
}

export const TIPO_MULTA_LABELS: Record<TipoMulta, string> = {
  AVARIA: 'Avaria',
  ATRASO: 'Atraso',
  COMBUSTIVEL_FALTANTE: 'Combustível faltante',
  LIMPEZA: 'Limpeza',
  OUTROS: 'Outros',
}

export const STATUS_MULTA_LABELS: Record<StatusMulta, string> = {
  PENDENTE: 'Pendente',
  COBRADA: 'Cobrada',
  CANCELADA: 'Cancelada',
}
