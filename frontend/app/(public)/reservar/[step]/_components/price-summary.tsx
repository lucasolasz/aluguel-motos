'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Moto, Seguro, Acessorio, LavagemServico, Local } from '@/lib/types'
import type { QuilometragemPlano } from './etapa3/_components/kilometragem-selector'
import { formatCurrency, formatDate } from '@/lib/data'

interface PriceSummaryProps {
  moto: Moto
  days: number
  seguro: Seguro | null
  acessorios: { acessorio: Acessorio; quantity: number }[]
  lavagem?: LavagemServico | null
  quilometragem?: QuilometragemPlano
  pickupDate?: Date
  returnDate?: Date
  horaRetirada?: string
  horaDevolucao?: string
  localRetirada?: Local | null
  localDevolucao?: Local | null
}

export function PriceSummary({
  moto,
  days,
  seguro,
  acessorios,
  lavagem = null,
  quilometragem = 'economica',
  pickupDate,
  returnDate,
  horaRetirada,
  horaDevolucao,
  localRetirada,
  localDevolucao,
}: PriceSummaryProps) {
  const formatDateLong = (date: Date, hora?: string) => {
    const label = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
    return hora ? `${label} às ${hora}` : label
  }

  const isIlimitada = quilometragem === 'ilimitada'
  const dailyRate = isIlimitada
    ? (moto.precoPorDia + 20) * days
    : moto.precoPorDia * days
  const insuranceCost = seguro ? seguro.precoPorDia * days : 0
  const accessoriesCost = acessorios.reduce(
    (total, item) => total + item.acessorio.precoPorDia * item.quantity * days,
    0
  )
  const lavagemCost = lavagem ? lavagem.valor : 0
  const subtotal = dailyRate + insuranceCost + accessoriesCost + lavagemCost
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
              priority
            />
          </div>
          <div>
            <p className="font-medium text-foreground">{moto.nome}</p>
            <p className="text-sm text-muted-foreground">
              {moto.marca} {moto.ano}
            </p>
          </div>
        </div>

        {(pickupDate || returnDate) && (
          <>
            <Separator />
            <div className="space-y-3">
              {pickupDate && (
                <div>
                   <p className="text-md font-bold text-foreground mb-2">Retirada</p>
                  <p className="text-sm font-medium text-foreground">{formatDateLong(pickupDate, horaRetirada)}</p>
                  {localRetirada && (
                    <p className="text-xs text-muted-foreground">{localRetirada.nome}</p>
                  )}
                </div>
              )}
              {returnDate && (
                <div>
                  <p className="text-md font-bold text-foreground mb-2">Devolução</p>
                  <p className="text-sm font-medium text-foreground">{formatDateLong(returnDate, horaDevolucao)}</p>
                  {localDevolucao && (
                    <p className="text-xs text-muted-foreground">{localDevolucao.nome}</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Franquia de km */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Franquia de km</span>
            <span className="text-sm font-semibold text-foreground">
              {isIlimitada ? formatCurrency(dailyRate) : 'Incluso'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isIlimitada
              ? `Quilometragem ilimitada — ${formatCurrency(moto.precoPorDia + 20)}/dia × ${days} ${days === 1 ? 'dia' : 'dias'}`
              : `Quilometragem econômica — ${formatCurrency(moto.precoPorDia)}/dia × ${days} ${days === 1 ? 'dia' : 'dias'}`}
          </p>
        </div>

        <Separator />

        {/* Outros custos */}
        <div className="space-y-2">
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

          {lavagem && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{lavagem.nome}</span>
              <span className="text-foreground">{formatCurrency(lavagemCost)}</span>
            </div>
          )}
        </div>

        {(seguro || acessorios.length > 0 || lavagem) && <Separator />}

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
