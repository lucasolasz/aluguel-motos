import type { Genero } from '@/lib/types'
import { isSenhaForte } from './password-checklist'
import { validarCpf, validarNomeCompleto, validarDdi, validarDdd } from '@/lib/validations'

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
  if (!validarNomeCompleto(d.nomeCompleto)) return 'Informe o nome completo (mínimo 2 palavras, apenas letras).'
  if (!validarCpf(d.cpf)) return 'CPF inválido.'
  if (!d.genero) return 'Selecione o gênero.'
  if (!validarDdi(d.ddi)) return 'DDI inválido (1 a 3 dígitos).'
  if (!validarDdd(d.ddd)) return 'DDD inválido (11 a 99).'
  if (d.celular.replace(/\D/g, '').length < 8) return 'Número de celular inválido.'
  if (!validarDdi(d.confirmarDdi)) return 'DDI de confirmação inválido.'
  if (!validarDdd(d.confirmarDdd)) return 'DDD de confirmação inválido.'
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
