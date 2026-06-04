import { API_URL } from '@/lib/config'
import { setToken } from '@/lib/auth'
import type { CreateClienteRegister } from '@/lib/types'

/**
 * Auto-cadastro de cliente (público, grupo GERAL). Lê a mensagem de erro do
 * backend (ex.: 409 "E-mail já cadastrado" / "CPF já cadastrado").
 */
export async function registrarCliente(data: CreateClienteRegister): Promise<void> {
  const res = await fetch(`${API_URL}/auth/register/cliente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'Erro ao realizar cadastro.'
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      // resposta sem corpo JSON
    }
    throw new Error(message)
  }
}

/** Login → grava o cookie auth-token (auto-login após cadastro). */
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
