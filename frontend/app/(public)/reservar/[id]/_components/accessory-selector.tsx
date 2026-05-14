'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import type { Acessorio } from '@/lib/types'
import { formatCurrency } from '@/lib/data'

interface AccessorySelectorProps {
  acessorios: Acessorio[]
  selected: { acessorioId: string; quantity: number }[]
  onUpdate: (acessorioId: string, quantity: number) => void
}

export function AccessorySelector({
  acessorios,
  selected,
  onUpdate,
}: AccessorySelectorProps) {
  const getQuantity = (acessorioId: string) => {
    const item = selected.find((s) => s.acessorioId === acessorioId)
    return item?.quantity || 0
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Acessórios Opcionais</h2>
        <p className="mt-1 text-muted-foreground">
          Adicione itens extras para melhorar sua experiência
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {acessorios.map((acessorio) => {
          const quantity = getQuantity(acessorio.id)

          return (
            <Card key={acessorio.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{acessorio.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {acessorio.descricao}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatCurrency(acessorio.precoPorDia)}/dia
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdate(acessorio.id, Math.max(0, quantity - 1))}
                    disabled={quantity === 0}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remover</span>
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onUpdate(
                        acessorio.id,
                        Math.min(acessorio.quantidadeMaxima, quantity + 1)
                      )
                    }
                    disabled={quantity >= acessorio.quantidadeMaxima}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Adicionar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
