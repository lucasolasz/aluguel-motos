'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { registrarCliente, login } from '@/services/auth.service'
import { montarTelefone, type DadosPessoais } from './dados-form'

interface Step2Props {
  dados: DadosPessoais
  onBack: () => void
  onConfirmed: () => void
}

const GENERO_LABEL: Record<string, string> = {
  FEMININO: 'Feminino',
  MASCULINO: 'Masculino',
  OUTRO: 'Outro',
}

function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 sm:flex-row sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function Step2Confirmacao({ dados, onBack, onConfirmed }: Step2Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirmar() {
    setSubmitting(true)
    setError('')
    try {
      const telefone = montarTelefone(dados)
      await registrarCliente({
        username: dados.email,
        password: dados.senha,
        nomeCompleto: dados.nomeCompleto,
        telefone,
        cpf: dados.cpf.replace(/\D/g, ''),
        genero: dados.genero as 'FEMININO' | 'MASCULINO' | 'OUTRO',
      })
      // auto-login para liberar os endpoints autenticados da etapa 3
      await login(dados.email, dados.senha)
      onConfirmed()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao realizar cadastro.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Confirmação do Cadastro</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Revise seus dados antes de concluir. Você poderá ajustar voltando à etapa anterior.
        </p>
      </div>

      <div className="rounded-xl border border-border p-4">
        <Linha label="Nome completo" value={dados.nomeCompleto} />
        <Linha label="CPF" value={dados.cpf} />
        <Linha label="Gênero" value={GENERO_LABEL[dados.genero] ?? '-'} />
        <Linha label="Celular" value={montarTelefone(dados)} />
        <Linha label="E-mail" value={dados.email} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={submitting}>
          Voltar
        </Button>
        <Button onClick={handleConfirmar} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Confirmar cadastro'}
        </Button>
      </div>
    </div>
  )
}
