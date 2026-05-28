'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { LocalResumo, Reservation } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/data'
import { Clock, MapPin } from 'lucide-react'

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
  if (!reservation) return null

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
        </div>
      </DialogContent>
    </Dialog>
  )
}
