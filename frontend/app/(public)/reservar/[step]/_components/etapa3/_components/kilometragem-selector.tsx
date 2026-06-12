'use client'

import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/data'

export type QuilometragemPlano = 'economica' | 'ilimitada'

interface KilometragemSelectorProps {
  precoEfetivo: number
  days: number
  selected: QuilometragemPlano
  onSelect: (plano: QuilometragemPlano) => void
}

export function KilometragemSelector({
  precoEfetivo,
  days,
  selected,
  onSelect,
}: KilometragemSelectorProps) {
  const precoIlimitada = precoEfetivo * 1.25
  const savingsPct = Math.round((25 / 125) * 100)
  const kmDisponiveis = 100 * days

  const cards = [
    {
      id: 'economica' as QuilometragemPlano,
      title: 'Quilometragem econômica',
      subtitle: `${kmDisponiveis} km disponíveis para você distribuir como quiser durante sua locação.`,
      price: precoEfetivo,
      extra: '+ R$0,50 por quilômetro excedente',
      badge: `${savingsPct}% de economia`,
    },
    {
      id: 'ilimitada' as QuilometragemPlano,
      title: 'Quilometragem ilimitada',
      subtitle: 'Tranquilidade para rodar o quanto quiser.',
      price: precoIlimitada,
      extra: 'Sem cobrança por quilômetro excedente',
      badge: null,
    },
  ]

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Plano de quilometragem">
      {cards.map((card) => {
        const isSelected = selected === card.id
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={cn(
              'relative w-full rounded-xl border-2 bg-white p-5 text-left transition-all duration-150',
              'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isSelected
                ? 'border-primary shadow-sm'
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
                  ? 'border-primary bg-primary'
                  : 'border-gray-300 bg-white'
              )}
            >
              {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>

            <div className="pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-gray-900">{card.title}</span>
                {card.badge && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {card.badge}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">{card.subtitle}</p>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(card.price)}
                </span>
                <span className="text-sm text-gray-500">/dia</span>
              </div>

              <p className="mt-1 text-xs text-gray-400">{card.extra}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
