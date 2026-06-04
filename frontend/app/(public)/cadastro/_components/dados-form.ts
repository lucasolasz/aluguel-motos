import type { Genero } from '@/lib/types'
import { isSenhaForte } from './password-checklist'

export interface DadosPessoais {
  nomeCompleto: string
  cpf: string
  genero: Genero | ''
  ddi: string
  ddd: string
  celular: string
  confirmarDdi: string
  confirmarDdd: string
  confirmarCelular: string
  email: string
  confirmarEmail: string
  senha: string
  confirmarSenha: string
}

export const EMPTY_DADOS: DadosPessoais = {
  nomeCompleto: '',
  cpf: '',
  genero: 'FEMININO',
  ddi: '55',
  ddd: '',
  celular: '',
  confirmarDdi: '55',
  confirmarDdd: '',
  confirmarCelular: '',
  email: '',
  confirmarEmail: '',
  senha: '',
  confirmarSenha: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Valida a etapa 1. Retorna mensagem de erro ou null se ok. */
export function validarDados(d: DadosPessoais): string | null {
  if (!d.nomeCompleto.trim()) return 'Informe o nome completo.'
  if (d.cpf.replace(/\D/g, '').length !== 11) return 'CPF inválido.'
  if (!d.genero) return 'Selecione o gênero.'
  if (!d.ddi.trim()) return 'Informe o DDI.'
  if (d.ddd.replace(/\D/g, '').length < 2) return 'DDD inválido.'
  if (d.celular.replace(/\D/g, '').length < 8) return 'Número de celular inválido.'
  if (!d.confirmarDdi.trim()) return 'Informe o DDI de confirmação.'
  if (d.confirmarDdd.replace(/\D/g, '').length < 2) return 'DDD de confirmação inválido.'
  if (d.confirmarCelular.replace(/\D/g, '').length < 8) return 'Número de confirmação de celular inválido.'
  const tel1 = `+${d.ddi.replace(/\D/g, '')}${d.ddd.replace(/\D/g, '')}${d.celular.replace(/\D/g, '')}`
  const tel2 = `+${d.confirmarDdi.replace(/\D/g, '')}${d.confirmarDdd.replace(/\D/g, '')}${d.confirmarCelular.replace(/\D/g, '')}`
  if (tel1 !== tel2) return 'A confirmação do celular não confere.'
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
