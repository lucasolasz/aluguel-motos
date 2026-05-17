'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Eye } from 'lucide-react'
import { apiFetch } from '@/lib/auth'

type ReservationStatus = 'PENDENTE' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA'

interface MotoResumo {
  id: string
  nome: string
  imagens: string[]
}

interface ClienteResumo {
  id: string
  nome: string
  email: string
}

interface Reservation {
  id: string
  status: ReservationStatus
  dataRetirada: string
  dataDevolucao: string
  totalDias: number
  moto: MotoResumo
  cliente: ClienteResumo
  precoPorDia: number
  caucao: number
  totalAluguel: number
  totalSeguro: number
  totalAcessorios: number
  total: number
  cartaoNumeroMascarado: string | null
  createdAt: string
}

const statusLabels: Record<ReservationStatus, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADA: 'Confirmada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}

const statusVariants: Record<ReservationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDENTE: 'outline',
  CONFIRMADA: 'default',
  EM_ANDAMENTO: 'secondary',
  CONCLUIDA: 'secondary',
  CANCELADA: 'destructive',
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<Reservation[]>('/api/admin/reservas')
      .then(setReservations)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const handleStatusChange = async (id: string, newStatus: ReservationStatus) => {
    try {
      const updated = await apiFetch<Reservation>(`/api/admin/reservas/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      )
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Gerenciar Reservas
        </h1>
        <p className="mt-1 text-muted-foreground">
          Visualize e gerencie todas as reservas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Reservas</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${reservations.length} reservas no sistema`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Carregando reservas...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Moto</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-mono text-sm">
                      {reservation.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {reservation.cliente?.nome || 'Cliente'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.cliente?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{reservation.moto?.nome}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(reservation.dataRetirada)}</p>
                        <p className="text-muted-foreground">
                          até {formatDate(reservation.dataDevolucao)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(reservation.total)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={reservation.status}
                        onValueChange={(value: ReservationStatus) =>
                          handleStatusChange(reservation.id, value)
                        }
                      >
                        <SelectTrigger className="w-36">
                          <Badge variant={statusVariants[reservation.status]}>
                            {statusLabels[reservation.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalhes</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}