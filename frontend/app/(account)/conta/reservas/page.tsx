'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ReservationCard } from './_components/reservation-card'
import { ReservationDetailsDialog } from './_components/reservation-details-dialog'
import { getMinhasReservas, cancelarReserva } from '@/services/reservas.service'
import type { Reservation } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    getMinhasReservas()
      .then(setReservations)
      .catch(() => setError('Erro ao carregar reservas.'))
      .finally(() => setLoading(false))
  }, [])

  const activeReservations = reservations.filter((r) =>
    ['AGUARDANDO_RETIRADA', 'EM_ANDAMENTO'].includes(r.status)
  )
  const pastReservations = reservations.filter((r) =>
    ['FINALIZADA', 'FINALIZADA_COM_AVARIA', 'CANCELADA'].includes(r.status)
  )

  const handleCancel = (id: string) => {
    setCancelingId(id)
  }

  const confirmCancel = async () => {
    if (!cancelingId) return
    setCanceling(true)
    try {
      const updated = await cancelarReserva(cancelingId)
      setReservations((prev) => prev.map((r) => (r.id === cancelingId ? updated : r)))
    } catch {
      alert('Erro ao cancelar reserva.')
    } finally {
      setCanceling(false)
      setCancelingId(null)
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
                onShowDetails={setSelectedReservation}
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
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onShowDetails={setSelectedReservation}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-muted-foreground">Nenhuma reserva no histórico.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ReservationDetailsDialog
        reservation={selectedReservation}
        open={!!selectedReservation}
        onOpenChange={(o) => !o && setSelectedReservation(null)}
      />

      <AlertDialog open={!!cancelingId} onOpenChange={(o) => !o && setCancelingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A reserva será cancelada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={canceling}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={canceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {canceling ? 'Cancelando...' : 'Confirmar cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
