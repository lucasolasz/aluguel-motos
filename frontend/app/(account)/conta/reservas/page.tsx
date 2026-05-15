'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReservationCard } from './_components/reservation-card'
import { getMinhasReservas, cancelarReserva } from '@/services/reservas.service'
import type { Reservation } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMinhasReservas()
      .then(setReservations)
      .catch(() => setError('Erro ao carregar reservas.'))
      .finally(() => setLoading(false))
  }, [])

  const activeReservations = reservations.filter((r) =>
    ['PENDENTE', 'CONFIRMADA', 'EM_ANDAMENTO'].includes(r.status)
  )
  const pastReservations = reservations.filter((r) =>
    ['CONCLUIDA', 'CANCELADA'].includes(r.status)
  )

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return
    try {
      const updated = await cancelarReserva(id)
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch {
      alert('Erro ao cancelar reserva.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minhas Reservas</h1>
          <p className="mt-1 text-muted-foreground">Gerencie suas reservas de motos</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/motos">
            <Plus className="h-4 w-4" />
            Nova Reserva
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Ativas ({activeReservations.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Histórico ({pastReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeReservations.length > 0 ? (
            activeReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancel}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-muted-foreground">Você não tem reservas ativas no momento.</p>
              <Button asChild className="mt-4">
                <Link href="/motos">Fazer uma Reserva</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {pastReservations.length > 0 ? (
            pastReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-muted-foreground">Nenhuma reserva no histórico.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
