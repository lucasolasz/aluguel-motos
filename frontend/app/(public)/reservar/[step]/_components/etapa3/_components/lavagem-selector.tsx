'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/data'
import type { LavagemServico } from '@/lib/types'

interface LavagemSelectorProps {
  lavagem: LavagemServico
  selected: boolean
  onToggle: (selected: boolean) => void
}

export function LavagemSelector({ lavagem, selected, onToggle }: LavagemSelectorProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!selected)}
      aria-pressed={selected}
      className={cn(
        'w-full overflow-hidden rounded-xl border-2 bg-white text-left transition-all duration-150',
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] focus-visible:ring-offset-2',
        selected ? 'border-[#1B5E20] shadow-sm' : 'border-gray-200 hover:border-gray-300'
      )}
    >
      {/* Cabeçalho */}
      <div
        className={cn(
          'flex items-start gap-3 p-4 transition-colors',
          selected ? 'bg-[#1B5E20] text-white' : 'bg-gray-50 text-gray-900'
        )}
      >
        <span
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
            selected ? 'border-white bg-white' : 'border-gray-300 bg-white'
          )}
        >
          {selected && <Check className="h-3.5 w-3.5 text-[#1B5E20]" strokeWidth={3} />}
        </span>

        <div className="flex-1">
          <p className="text-base font-semibold">Economize 40% comprando a lavagem agora</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{formatCurrency(lavagem.valor)}</span>
            <span className={cn('text-xs', selected ? 'text-white/80' : 'text-gray-500')}>
              *valor único
            </span>
          </div>
        </div>
      </div>

      {/* Descrição */}
      <p className="p-4 text-sm text-gray-500">{lavagem.descricao}</p>
    </button>
  )
}
