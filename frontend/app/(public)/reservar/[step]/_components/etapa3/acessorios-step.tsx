'use client'

import type { Acessorio } from '@/lib/types'
import { KilometragemSelector, type QuilometragemPlano } from './_components/kilometragem-selector'
import { AccessorySelector } from './_components/accessory-selector'

interface AcessoriosStepProps {
  acessorios: Acessorio[]
  selected: { acessorioId: string; quantity: number }[]
  onUpdate: (acessorioId: string, quantity: number) => void
  precoPorDia: number
  days: number
  selectedQuilometragem: QuilometragemPlano
  onQuilometragemChange: (plano: QuilometragemPlano) => void
}

export function AcessoriosStep({
  acessorios,
  selected,
  onUpdate,
  precoPorDia,
  days,
  selectedQuilometragem,
  onQuilometragemChange,
}: AcessoriosStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Tarifas e adicionais</h2>
        <p className="mt-1 text-muted-foreground">
          Escolha o plano de quilometragem e adicione itens extras
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold text-foreground">Quilometragem</h3>
        <KilometragemSelector
          precoPorDia={precoPorDia}
          days={days}
          selected={selectedQuilometragem}
          onSelect={onQuilometragemChange}
        />
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold text-foreground">Acessórios opcionais</h3>
        <AccessorySelector acessorios={acessorios} selected={selected} onUpdate={onUpdate} />
      </div>
    </div>
  )
}
