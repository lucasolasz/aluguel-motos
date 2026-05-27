'use client'

import type { Seguro } from '@/lib/types'
import { InsuranceSelector } from './_components/insurance-selector'

interface SeguroStepProps {
  seguros: Seguro[]
  selectedId: string
  onSelect: (id: string) => void
}

export function SeguroStep({ seguros, selectedId, onSelect }: SeguroStepProps) {
  return <InsuranceSelector seguros={seguros} selectedId={selectedId} onSelect={onSelect} />
}
