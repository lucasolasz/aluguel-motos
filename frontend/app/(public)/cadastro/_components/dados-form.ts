import type { Genero } from '@/lib/types'
import { isSenhaForte } from './password-checklist'

export interface DadosPessoais {
  nomeCompleto: string
  nacionalidade: string
  tipoDocumento: string
  cpf: string
  genero: Genero | ''
  ddi: string
  ddd: string
  celular: string
  email: string
  confirmarCelular: string
  confirmarEmail: string
  senha: string
  confirmarSenha: string
}

export const EMPTY_DADOS: DadosPessoais = {
  nomeCompleto: '',
  nacionalidade: 'Brasil',
  tipoDocumento: 'CPF',
  cpf: '',
  genero: '',
  ddi: '55',
  ddd: '',
  celular: '',
  email: '',
  confirmarCelular: '',
  confirmarEmail: '',
  senha: '',
  confirmarSenha: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Valida a etapa 1. Retorna mensagem de erro ou null se ok. */
export function validarDados(d: DadosPessoais): string | null {
  if (!d.nomeCompleto.trim()) return 'Informe o nome completo.'
  if (!d.nacionalidade.trim()) return 'Informe a nacionalidade.'
  if (d.cpf.replace(/\D/g, '').length !== 11) return 'CPF inválido.'
  if (!d.genero) return 'Selecione o gênero.'
  if (!d.ddi.trim()) return 'Informe o DDI.'
  if (d.ddd.replace(/\D/g, '').length < 2) return 'DDD inválido.'
  if (d.celular.replace(/\D/g, '').length < 8) return 'Número de celular inválido.'
  if (d.celular !== d.confirmarCelular) return 'A confirmação do celular não confere.'
  if (!EMAIL_REGEX.test(d.email)) return 'E-mail inválido.'
  if (d.email !== d.confirmarEmail) return 'A confirmação do e-mail não confere.'
  if (!isSenhaForte(d.senha)) return 'A senha não atende aos requisitos.'
  if (d.senha !== d.confirmarSenha) return 'A confirmação da senha não confere.'
  return null
}

/** Monta o telefone no formato +5511999999999. */
export function montarTelefone(d: DadosPessoais): string {
  return `+${d.ddi.replace(/\D/g, '')}${d.ddd.replace(/\D/g, '')}${d.celular.replace(/\D/g, '')}`
}
