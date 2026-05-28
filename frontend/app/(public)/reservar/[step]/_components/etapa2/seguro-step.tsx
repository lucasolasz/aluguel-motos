'use client'

import type { Seguro } from '@/lib/types'
import { InsuranceSelector } from './_components/insurance-selector'

interface SeguroStepProps {
  seguros: Seguro[]
  selectedId: string
  onSelect: (id: string) => void
  days: number
}

export function SeguroStep({ seguros, selectedId, onSelect, days }: SeguroStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Escolha seu Seguro</h2>
        <p className="mt-1 text-muted-foreground">Selecione a proteção ideal para sua viagem</p>
      </div>
      <InsuranceSelector seguros={seguros} selectedId={selectedId} onSelect={onSelect} days={days} />
    </div>
  )
}
