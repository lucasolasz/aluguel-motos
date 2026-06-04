export function validarCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

export function validarLuhn(numero: string): boolean {
  const digits = numero.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false

  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

export function validarValidadeCartao(validade: string): boolean {
  const digits = validade.replace(/\D/g, '')
  if (digits.length !== 4) return false

  const mes = parseInt(digits.slice(0, 2))
  const ano = parseInt('20' + digits.slice(2, 4))

  if (mes < 1 || mes > 12) return false

  const hoje = new Date()
  const anoAtual = hoje.getFullYear()
  const mesAtual = hoje.getMonth() + 1

  if (ano < anoAtual) return false
  if (ano === anoAtual && mes < mesAtual) return false

  return true
}

export function validarNomeCartao(nome: string): boolean {
  const trimmed = nome.trim()
  if (trimmed.length < 5) return false
  if (!/^[A-ZÀ-Ú\s]+$/.test(trimmed)) return false
  return true
}

export function validarNomeCompleto(nome: string): boolean {
  const trimmed = nome.trim()
  if (trimmed.length < 3) return false
  if (!/^[A-ZÀ-Ú\s]+$/i.test(trimmed)) return false

  const palavras = trimmed.split(/\s+/).filter((p) => p.length > 0)
  if (palavras.length < 2) return false

  return true
}

export function validarDdi(ddi: string): boolean {
  const digits = ddi.replace(/\D/g, '')
  return digits.length >= 1 && digits.length <= 3
}

export function validarDdd(ddd: string): boolean {
  const digits = ddd.replace(/\D/g, '')
  if (digits.length !== 2) return false
  const num = parseInt(digits)
  return num >= 11 && num <= 99
}

export interface CardValidationData {
  nome: string
  numero: string
  validade: string
  cvv: string
  cpf: string
}

export function validarCartaoCompleto(c: CardValidationData): string | null {
  if (!validarNomeCartao(c.nome)) {
    return 'Informe o nome impresso no cartão (apenas letras, mínimo 5 caracteres).'
  }

  const numeroDigits = c.numero.replace(/\D/g, '')
  if (numeroDigits.length !== 16) {
    return 'Número do cartão deve ter 16 dígitos.'
  }
  if (!validarLuhn(c.numero)) {
    return 'Número do cartão inválido.'
  }

  if (!validarValidadeCartao(c.validade)) {
    return 'Validade do cartão inválida ou cartão vencido.'
  }

  const cvvDigits = c.cvv.replace(/\D/g, '')
  if (cvvDigits.length < 3 || cvvDigits.length > 4) {
    return 'CVV inválido (3 ou 4 dígitos).'
  }

  if (!validarCpf(c.cpf)) {
    return 'CPF do titular inválido.'
  }

  return null
}

export interface AddressValidationData {
  cep: string
  logradouro: string
  numero: string
  semNumero: boolean
  estado: string
  cidade: string
  bairro: string
}

export function validarEnderecoCompleto(a: AddressValidationData): string | null {
  const cepDigits = a.cep.replace(/\D/g, '')
  if (cepDigits.length !== 8) {
    return 'CEP inválido.'
  }
  if (!a.logradouro.trim()) {
    return 'Informe o logradouro.'
  }
  if (!a.semNumero && !a.numero.trim()) {
    return 'Informe o número ou marque "Sem número".'
  }
  if (!a.estado) {
    return 'Selecione o estado.'
  }
  if (!a.cidade) {
    return 'Selecione a cidade.'
  }
  if (!a.bairro.trim()) {
    return 'Informe o bairro.'
  }
  return null
}
