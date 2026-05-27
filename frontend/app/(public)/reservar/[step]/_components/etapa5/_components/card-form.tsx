'use client'

import { ArrowLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MaskedInput } from '../../masked-input'
import type { NewCardData } from '../use-step5'

interface CardFormProps {
  data: NewCardData
  onChange: (updater: (prev: NewCardData) => NewCardData) => void
  onSubmit: () => void
  isValid: boolean
  onBack?: () => void
}

export function CardForm({ data, onChange, onSubmit, isValid, onBack }: CardFormProps) {
  return (
    <div className="border-t border-border pt-6">
      <div className="mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">Dados do Cartão</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cardNome">Nome no Cartão</Label>
          <Input
            id="cardNome"
            value={data.nome}
            onChange={(e) => onChange((p) => ({ ...p, nome: e.target.value.toUpperCase() }))}
            placeholder="COMO APARECE NO CARTÃO"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cardNumero">Número do Cartão</Label>
          <MaskedInput
            id="cardNumero"
            mask="0000 0000 0000 0000"
            value={data.numero}
            onAccept={(val) => onChange((p) => ({ ...p, numero: val }))}
            placeholder="0000 0000 0000 0000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cardValidade">Validade</Label>
          <MaskedInput
            id="cardValidade"
            mask="00/00"
            value={data.validade}
            onAccept={(val) => onChange((p) => ({ ...p, validade: val }))}
            placeholder="MM/AA"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cardCvv">CVV</Label>
          <MaskedInput
            id="cardCvv"
            mask="000"
            value={data.cvv}
            onAccept={(val) => onChange((p) => ({ ...p, cvv: val }))}
            placeholder="000"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cardCpf">CPF do Titular</Label>
          <MaskedInput
            id="cardCpf"
            mask="000.000.000-00"
            value={data.cpf}
            onAccept={(val) => onChange((p) => ({ ...p, cpf: val }))}
            placeholder="000.000.000-00"
          />
        </div>
      </div>
      <Button
        className="mt-4 w-full gap-2"
        onClick={onSubmit}
        disabled={!isValid}
      >
        <CreditCard className="h-4 w-4" />
        Confirmar Dados do Cartão
      </Button>
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-2 w-full gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para meus cartões
        </Button>
      )}
    </div>
  )
}
