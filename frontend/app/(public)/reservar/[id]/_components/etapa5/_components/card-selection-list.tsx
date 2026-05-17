'use client'

import { CreditCard, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { Cartao } from '@/lib/types'

interface CardSelectionListProps {
  cards: Cartao[]
  selectedCardId: string | null
  onSelectedCardIdChange: (id: string) => void
  onAddNewCard: () => void
  onAddAddressForCard: (cardId: string) => void
  onDeleteCard: (id: string) => void
  deletingCardId: string | null
}

export function CardSelectionList({
  cards,
  selectedCardId,
  onSelectedCardIdChange,
  onAddNewCard,
  onAddAddressForCard,
  onDeleteCard,
  deletingCardId,
}: CardSelectionListProps) {
  return (
    <div className="border-t border-border pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">Selecionar Cartão</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs"
          onClick={onAddNewCard}
        >
          <Plus className="h-3 w-3" />
          Novo cartão
        </Button>
      </div>
      <RadioGroup value={selectedCardId ?? ''} onValueChange={onSelectedCardIdChange}>
        {cards.map((card) => (
          <label
            key={card.id}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors',
              selectedCardId === card.id && 'border-primary bg-primary/5',
              !card.enderecoCobranca && 'cursor-default opacity-60'
            )}
          >
            <RadioGroupItem value={card.id} id={card.id} disabled={!card.enderecoCobranca} className="mt-1" />
            <div className="flex-1">
              <p className="font-medium text-foreground">{card.nome}</p>
              <p className="text-sm text-muted-foreground">
                {card.numeroMascarado} &bull; Validade {card.validade}
              </p>
              {card.enderecoCobranca ? (
                <p className="text-xs text-muted-foreground">
                  {(card.enderecoCobranca.logradouro + (card.enderecoCobranca.numero ? `, ${card.enderecoCobranca.numero}` : '') + ' — ' + card.enderecoCobranca.cidade).toUpperCase()}
                </p>
              ) : (
                <button
                  type="button"
                  className="mt-1 text-xs text-primary underline-offset-2 hover:underline"
                  onClick={(e) => {
                    e.preventDefault()
                    onAddAddressForCard(card.id)
                  }}
                >
                  Adicionar endereço de cobrança
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                disabled={deletingCardId === card.id}
                onClick={(e) => {
                  e.preventDefault()
                  onDeleteCard(card.id)
                }}
              >
                {deletingCardId === card.id
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />
                }
              </Button>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
