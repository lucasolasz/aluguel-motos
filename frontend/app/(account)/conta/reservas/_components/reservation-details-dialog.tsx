'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { LocalResumo, Reservation } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/data'
import {
  type Multa,
  type StatusMulta,
  TIPO_MULTA_LABELS,
  STATUS_MULTA_LABELS,
} from '@/lib/atendimento-types'
import { getMultasDaReserva } from '@/services/multas.service'
import { Clock, MapPin } from 'lucide-react'

const STATUS_BADGE: Record<StatusMulta, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  COBRADA: 'bg-green-100 text-green-800 border-green-300',
  CANCELADA: 'bg-red-100 text-red-800 border-red-300',
}

interface ReservationDetailsDialogProps {
  reservation: Reservation | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatHora(hora: string | null): string {
  if (!hora) return '--:--'
  return hora.slice(0, 5)
}

function formatEnderecoLinha1(local: LocalResumo): string {
  const partes = [`${local.logradouro}, ${local.numero}`]
  if (local.complemento) partes.push(local.complemento)
  return partes.join(' - ')
}

function formatEnderecoLinha2(local: LocalResumo): string {
  return `${local.bairro} — ${local.cidade}/${local.estado}`
}

function LocalBlock({
  titulo,
  local,
  data,
  hora,
}: {
  titulo: string
  local: LocalResumo | null
  data: string
  hora: string | null
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </p>
      {local ? (
        <>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="space-y-0.5 text-sm">
              <p className="font-medium text-foreground">{local.nome}</p>
              <p className="text-muted-foreground">{formatEnderecoLinha1(local)}</p>
              <p className="text-muted-foreground">{formatEnderecoLinha2(local)}</p>
              <p className="text-muted-foreground">CEP {local.cep}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {formatDate(data)} às {formatHora(hora)}
            </span>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Local não informado</p>
      )}
    </div>
  )
}

export function ReservationDetailsDialog({
  reservation,
  open,
  onOpenChange,
}: ReservationDetailsDialogProps) {
  const [multas, setMultas] = useState<Multa[] | null>(null)

  useEffect(() => {
    if (!open || !reservation) { setMultas(null); return }
    getMultasDaReserva(reservation.id)
      .then(setMultas)
      .catch(() => setMultas([]))
  }, [open, reservation?.id])

  if (!reservation) return null

  const multasVisiveis = multas?.filter((m) => m.status !== 'CANCELADA') ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Detalhes da reserva #{reservation.id.slice(-8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Diárias
            </h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(reservation.precoPorDia)} × {reservation.totalDias}{' '}
                {reservation.totalDias === 1 ? 'dia' : 'dias'}
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrency(reservation.totalAluguel)}
              </span>
            </div>
          </section>

          {reservation.seguro && (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Seguro
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">{reservation.seguro.nome}</p>
                    <p className="text-muted-foreground">
                      {formatCurrency(reservation.seguro.precoPorDia)} / dia
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(reservation.totalSeguro)}
                  </span>
                </div>
              </section>
            </>
          )}

          {reservation.acessorios.length > 0 && (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Opcionais
                </h3>
                <ul className="space-y-2">
                  {reservation.acessorios.map((item) => (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-foreground">
                          {item.nome}{' '}
                          <span className="text-muted-foreground">×{item.quantidade}</span>
                        </p>
                        <p className="text-muted-foreground">
                          {formatCurrency(item.precoPorDia)} / dia
                        </p>
                      </div>
                      <span className="font-medium text-foreground">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
                  <span className="text-muted-foreground">Total opcionais</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(reservation.totalAcessorios)}
                  </span>
                </div>
              </section>
            </>
          )}

          {reservation.lavagem && (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Limpeza garantida
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-foreground">{reservation.lavagem.nome}</p>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(reservation.totalLavagem)}
                  </span>
                </div>
              </section>
            </>
          )}

          <Separator />

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Locais e horários
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LocalBlock
                titulo="Retirada"
                local={reservation.localRetirada}
                data={reservation.dataRetirada}
                hora={reservation.horaRetirada}
              />
              <LocalBlock
                titulo="Devolução"
                local={reservation.localDevolucao}
                data={reservation.dataDevolucao}
                hora={reservation.horaDevolucao}
              />
            </div>
          </section>

          <Separator />

          <section className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(reservation.total)}
            </span>
          </section>

          {multasVisiveis.length > 0 && (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Multas
                </h3>
                <ul className="space-y-2">
                  {multasVisiveis.map((m) => (
                    <li key={m.id} className="flex items-start justify-between text-sm gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{TIPO_MULTA_LABELS[m.tipo]}</span>
                          <Badge variant="outline" className={`text-xs ${STATUS_BADGE[m.status]}`}>
                            {STATUS_MULTA_LABELS[m.status]}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{m.descricao}</p>
                      </div>
                      <span className="font-medium text-destructive shrink-0">
                        {formatCurrency(m.valor)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
