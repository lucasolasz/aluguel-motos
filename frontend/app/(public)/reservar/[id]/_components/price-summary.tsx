'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Moto, Seguro, Acessorio } from '@/lib/types'
import { formatCurrency } from '@/lib/data'

interface PriceSummaryProps {
  moto: Moto
  days: number
  seguro: Seguro | null
  acessorios: { acessorio: Acessorio; quantity: number }[]
}

export function PriceSummary({
  moto,
  days,
  seguro,
  acessorios,
}: PriceSummaryProps) {
  const dailyRate = moto.precoPorDia * days
  const insuranceCost = seguro ? seguro.precoPorDia * days : 0
  const accessoriesCost = acessorios.reduce(
    (total, item) => total + item.acessorio.precoPorDia * item.quantity * days,
    0
  )
  const subtotal = dailyRate + insuranceCost + accessoriesCost
  const fotoPrincipal =
    moto.fotos.find((f) => f.principal)?.url || moto.fotos[0]?.url || '/images/placeholder-moto.jpg'

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Resumo da Reserva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Moto Info */}
        <div className="flex gap-4 items-center">
          <div className="relative h-36 w-54 shrink-0 overflow-hidden rounded-lg bg-muted border">
            <Image
              src={fotoPrincipal}
              alt={moto.nome}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-foreground">{moto.nome}</p>
            <p className="text-sm text-muted-foreground">
              {moto.marca} {moto.ano}
            </p>
          </div>
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Diária ({days} {days === 1 ? 'dia' : 'dias'})
            </span>
            <span className="text-foreground">{formatCurrency(dailyRate)}</span>
          </div>

          {seguro && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{seguro.nome}</span>
              <span className="text-foreground">
                {insuranceCost === 0 ? 'Incluso' : formatCurrency(insuranceCost)}
              </span>
            </div>
          )}

          {acessorios.length > 0 && (
            <>
              {acessorios.map((item) => (
                <div key={item.acessorio.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.acessorio.nome} x{item.quantity}
                  </span>
                  <span className="text-foreground">
                    {formatCurrency(item.acessorio.precoPorDia * item.quantity * days)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="font-medium text-foreground">Subtotal</span>
          <span className="font-medium text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Security Deposit */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Caução (pré-autorização)
          </span>
          <span className="text-muted-foreground">
            {formatCurrency(moto.caucao)}
          </span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between">
          <span className="text-lg font-bold text-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          * O valor do caução será liberado após a devolução da moto em perfeitas condições.
        </p>
      </CardContent>
    </Card>
  )
}
