'use client'

import type { Acessorio } from '@/lib/types'
import { AccessorySelector } from './_components/accessory-selector'

interface AcessoriosStepProps {
  acessorios: Acessorio[]
  selected: { acessorioId: string; quantity: number }[]
  onUpdate: (acessorioId: string, quantity: number) => void
}

export function AcessoriosStep({ acessorios, selected, onUpdate }: AcessoriosStepProps) {
  return <AccessorySelector acessorios={acessorios} selected={selected} onUpdate={onUpdate} />
}
