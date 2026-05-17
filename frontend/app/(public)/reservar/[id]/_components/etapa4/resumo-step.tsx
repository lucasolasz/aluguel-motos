'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Acessorio, Moto, Seguro } from '@/lib/types'

interface ResumoStepProps {
  moto: Moto
  pickupDate?: Date
  returnDate?: Date
  days: number
  selectedSeguro: Seguro | null
  acessoriosWithDetails: { acessorio: Acessorio; quantity: number }[]
}

export function ResumoStep({
  moto,
  pickupDate,
  returnDate,
  days,
  selectedSeguro,
  acessoriosWithDetails,
}: ResumoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Confirme sua Reserva</h2>
        <p className="mt-1 text-muted-foreground">Revise os detalhes antes de continuar</p>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Moto</p>
          <p className="font-medium text-foreground">{moto.nome}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Período</p>
          <p className="font-medium text-foreground">
            {pickupDate && format(pickupDate, "dd 'de' MMMM", { locale: ptBR })} -{' '}
            {returnDate && format(returnDate, "dd 'de' MMMM", { locale: ptBR })} ({days} {days === 1 ? 'dia' : 'dias'})
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Seguro</p>
          <p className="font-medium text-foreground">{selectedSeguro?.nome}</p>
        </div>
        {acessoriosWithDetails.length > 0 && (
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Acessórios</p>
            <p className="font-medium text-foreground">
              {acessoriosWithDetails.map((item) => `${item.acessorio.nome} x${item.quantity}`).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
