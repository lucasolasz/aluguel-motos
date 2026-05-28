'use client'

import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/data'
import { Shield } from 'lucide-react'
import type { Seguro } from '@/lib/types'

interface InsuranceSelectorProps {
  seguros: Seguro[]
  selectedId: string
  onSelect: (seguroId: string) => void
}

const SORT_ORDER: Record<string, number> = {
  padrão: 0,
  padrao: 0,
  completo: 1,
  premium: 2,
}

function getSortKey(nome: string): number {
  const key = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  for (const [k, v] of Object.entries(SORT_ORDER)) {
    if (key.includes(k)) return v
  }
  return 99
}

export function InsuranceSelector({
  seguros,
  selectedId,
  onSelect,
}: InsuranceSelectorProps) {
  const sorted = [...seguros].sort((a, b) => getSortKey(a.nome) - getSortKey(b.nome))

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Plano de seguro">
      {sorted.map((seguro) => {
        const isSelected = selectedId === seguro.id
        return (
          <button
            key={seguro.id}
            type="button"
            onClick={() => onSelect(seguro.id)}
            className={cn(
              'relative w-full rounded-xl border-2 bg-white p-5 text-left transition-all duration-150',
              'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2',
              isSelected
                ? 'border-[#2E7D32] shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            )}
            role="radio"
            aria-checked={isSelected}
          >
            {/* Radio indicator */}
            <span
              className={cn(
                'absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                isSelected
                  ? 'border-[#2E7D32] bg-[#2E7D32]'
                  : 'border-gray-300 bg-white'
              )}
            >
              {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>

            <div className="pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-gray-900">{seguro.nome}</span>
                {seguro.basico && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    Incluso
                  </span>
                )}
                {getSortKey(seguro.nome) === 1 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Recomendado
                  </span>
                )}
                {seguro.percentualDesconto > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {seguro.percentualDesconto}% de desconto
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">{seguro.descricao}</p>

              {seguro.basico ? (
                <p className="mt-3 text-2xl font-bold text-gray-900">Gratuito</p>
              ) : (
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(seguro.precoPorDia)}
                  </span>
                  <span className="text-sm text-gray-500">/dia</span>
                </div>
              )}

              {seguro.coberturas.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {seguro.coberturas.map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Shield className="h-3 w-3 shrink-0 text-[#2E7D32]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
