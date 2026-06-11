'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Moto, Seguro, Acessorio, LavagemServico, Local } from '@/lib/types'
import type { QuilometragemPlano } from './etapa3/_components/kilometragem-selector'
import type { PrecificacaoConfig } from '@/lib/pricing'
import { fatorDesconto, fatorSazonal } from '@/lib/pricing'
import { formatCurrency } from '@/lib/data'

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
  precificacaoConfig?: PrecificacaoConfig | null
  currentStep: number
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
  precificacaoConfig,
  currentStep,
}: PriceSummaryProps) {
  const formatDateLong = (date: Date, hora?: string) => {
    const label = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
    return hora ? `${label} às ${hora}` : label
  }

  const isIlimitada = quilometragem === 'ilimitada'

  const config = precificacaoConfig
  const effectiveDays = days > 0 ? days : 1
  const dataRetirada = pickupDate ?? new Date()

  const fDesc = config ? fatorDesconto(effectiveDays, config) : 1
  const fSaz = config ? fatorSazonal(dataRetirada, config) : 1

  const precoBaseComDesconto = config
    ? moto.precoPorDia * fDesc * fSaz
    : moto.precoPorDia

  const diariaEconomica = Math.round(precoBaseComDesconto * 100) / 100
  const diariaIlimitada = Math.round(diariaEconomica * 1.25 * 100) / 100
  const diariaFinal = isIlimitada ? diariaIlimitada : diariaEconomica

  const dailyRate = diariaFinal * effectiveDays
  const diariaBaseTotal = diariaEconomica * effectiveDays
  const franquiaIlimitadaTotal = isIlimitada ? (diariaEconomica * 0.25 * effectiveDays) : 0
  const kmPorDia = 100
  const kmTotal = kmPorDia * effectiveDays
  const insuranceCost = seguro ? seguro.precoPorDia * effectiveDays : 0
  const accessoriesCost = acessorios.reduce(
    (total, item) => total + item.acessorio.precoPorDia * item.quantity * effectiveDays,
    0
  )
  const lavagemCost = lavagem ? lavagem.valor : 0
  const showSeguro = currentStep >= 2
  const showEtapa3 = currentStep >= 3
  const subtotal = dailyRate + (showSeguro ? insuranceCost : 0) + (showEtapa3 ? accessoriesCost + lavagemCost : 0)
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

        {/* Grupo */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Grupo</p>
          <p className="text-sm text-muted-foreground">{moto.categoria.nome}</p>
          <p className="text-sm text-muted-foreground">{moto.nome}</p>
        </div>

        <Separator />

        {/* Diárias */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Diárias</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {effectiveDays} diária(s) x {formatCurrency(diariaEconomica)}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(diariaBaseTotal)}
            </span>
          </div>
        </div>

        {showEtapa3 && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Franquia de km</p>
              <div className="flex items-center justify-between">
                {isIlimitada ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {effectiveDays} diária(s) x {formatCurrency(diariaEconomica * 0.25)}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(franquiaIlimitadaTotal)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {effectiveDays} diária(s) x {kmPorDia}km = {kmTotal}km
                    </span>
                    <span className="text-sm font-semibold text-foreground">Incluso(s)</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {showSeguro && seguro && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{seguro.nome}</span>
                <span className="text-sm font-semibold text-foreground">
                  {insuranceCost === 0 ? 'Incluso' : formatCurrency(insuranceCost)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(seguro.precoPorDia)}/dia × {effectiveDays} {effectiveDays === 1 ? 'dia' : 'dias'}
              </p>
            </div>
          </>
        )}

        {showEtapa3 && acessorios.map((item) => (
          <div key={item.acessorio.id}>
            <Separator />
            <div className="space-y-1 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {item.acessorio.nome} ×{item.quantity}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(item.acessorio.precoPorDia * item.quantity * effectiveDays)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(item.acessorio.precoPorDia)}/dia × {item.quantity} un × {effectiveDays} {effectiveDays === 1 ? 'dia' : 'dias'}
              </p>
            </div>
          </div>
        ))}

        {showEtapa3 && lavagem && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{lavagem.nome}</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(lavagemCost)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Valor único</p>
            </div>
          </>
        )}

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
