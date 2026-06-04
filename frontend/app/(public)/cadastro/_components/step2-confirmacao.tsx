'use client'

import { Button } from '@/components/ui/button'
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onConfirmed}>
          Confirmar e continuar
        </Button>
      </div>
    </div>
  )
}
