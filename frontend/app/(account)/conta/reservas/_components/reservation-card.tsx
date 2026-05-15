import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Reservation } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/data'
import { Calendar, X } from 'lucide-react'

interface ReservationCardProps {
  reservation: Reservation
  onCancel?: (id: string) => void
}

const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADA: 'Confirmada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDENTE: 'outline',
  CONFIRMADA: 'default',
  EM_ANDAMENTO: 'secondary',
  CONCLUIDA: 'secondary',
  CANCELADA: 'destructive',
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const canCancel = ['PENDENTE', 'CONFIRMADA'].includes(reservation.status)
  const imagemUrl = reservation.moto.imagens[0] ?? '/images/placeholder-moto.jpg'

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-32">
            <Image
              src={imagemUrl}
              alt={reservation.moto.nome}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Reserva #{reservation.id.slice(-8).toUpperCase()}
                  </p>
                  <h3 className="font-semibold text-foreground">
                    {reservation.moto.nome}
                  </h3>
                </div>
                <Badge variant={statusVariants[reservation.status]}>
                  {statusLabels[reservation.status]}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(reservation.dataRetirada)} -{' '}
                  {formatDate(reservation.dataDevolucao)}
                </span>
                <span>
                  ({reservation.totalDias}{' '}
                  {reservation.totalDias === 1 ? 'dia' : 'dias'})
                </span>
              </div>

              <p className="text-lg font-bold text-foreground">
                {formatCurrency(reservation.total)}
              </p>
            </div>

            <div className="flex flex-wrap items-start gap-2 sm:flex-col">
              {canCancel && onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() => onCancel(reservation.id)}
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
