import { API_URL } from '@/lib/config'
import { setToken } from '@/lib/auth'

export interface CompleteRegisterData {
  username: string
  password: string
  nomeCompleto: string
  telefone: string
  cpf: string
  genero: 'FEMININO' | 'MASCULINO' | 'OUTRO'
  cnh: {
    rg: string
    dataNascimento: string
    numeroRegistro: string
    numeroCnh: string
    dataValidade: string
    estado: string
  }
  cartao: {
    nome: string
    cpf: string
    numero: string
    validade: string
  }
  endereco: {
    cep: string
    logradouro: string
    numero: string
    semNumero: boolean
    complemento: string
    estado: string
    cidade: string
    bairro: string
  }
  enderecoUsuario: {
    cep: string
    logradouro: string
    numero: string
    semNumero: boolean
    complemento: string
    estado: string
    cidade: string
    bairro: string
  }
}

async function extractErrorMessage(res: Response, defaultMessage: string): Promise<string> {
  try {
    const body = await res.json()
    if (body?.message) return body.message
  } catch {
    // resposta sem corpo JSON
  }
  return defaultMessage
}

/**
 * Cadastro completo: cria usuário + CNH + cartão + endereço em uma transação atômica.
 * Retorna o token JWT e já o armazena no cookie.
 */
export async function registrarCompleto(data: CompleteRegisterData): Promise<void> {
  const res = await fetch(`${API_URL}/auth/register/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const message = await extractErrorMessage(res, 'Erro ao realizar cadastro.')
    throw new Error(message)
  }
  const result = await res.json()
  setToken(result.token)
}

/** Login → grava o cookie auth-token. */
export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    throw new Error('Erro ao autenticar.')
  }
  const data = await res.json()
  setToken(data.token)
}

/** Verifica se o e-mail já está cadastrado. */
export async function checkEmailAvailable(email: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(email)}`)
  if (!res.ok) return true
  const data = await res.json()
  return data.available
}

/** Verifica se o CPF já está cadastrado. */
export async function checkCpfAvailable(cpf: string): Promise<boolean> {
  const digits = cpf.replace(/\D/g, '')
  const res = await fetch(`${API_URL}/auth/check-cpf?cpf=${encodeURIComponent(digits)}`)
  if (!res.ok) return true
  const data = await res.json()
  return data.available
}
