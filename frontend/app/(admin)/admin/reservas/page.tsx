'use client'

import { useState, useEffect, useCallback } from 'react'
import { logError } from '@/lib/logger'
import Link from 'next/link'
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
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Eye, Search, KeyRound, Undo2 } from 'lucide-react'
import { apiFetch } from '@/lib/auth'
import { adminListarReservas } from '@/services/reservas.service'
import type { AdminReservaResumo, StatusReserva } from '@/lib/atendimento-types'

const statusLabels: Record<StatusReserva, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADA: 'Confirmada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}

const statusVariants: Record<StatusReserva, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDENTE: 'outline',
  CONFIRMADA: 'default',
  EM_ANDAMENTO: 'secondary',
  CONCLUIDA: 'secondary',
  CANCELADA: 'destructive',
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<AdminReservaResumo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')

  const carregar = useCallback(async (cpf?: string) => {
    setIsLoading(true)
    try {
      setReservations(await adminListarReservas(cpf))
    } catch (error) {
      logError('Erro ao carregar reservas:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    carregar(query)
  }

  // Filtro client-side adicional por nome/e-mail (CPF é filtrado no backend)
  const termo = query.trim().toLowerCase()
  const temLetras = /[a-z]/i.test(termo)
  const visiveis = temLetras
    ? reservations.filter(
        (r) =>
          (r.cliente?.nome || '').toLowerCase().includes(termo) ||
          (r.cliente?.email || '').toLowerCase().includes(termo),
      )
    : reservations

  const handleStatusChange = async (id: string, newStatus: StatusReserva) => {
    try {
      const updated = await apiFetch<AdminReservaResumo>(`/api/admin/reservas/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (error) {
      logError('Erro ao atualizar status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Reservas</h1>
        <p className="mt-1 text-muted-foreground">
          Busque pelo CPF do cliente para iniciar a retirada ou devolução
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Reservas</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${visiveis.length} reserva(s)`}
          </CardDescription>
          <form onSubmit={handleBuscar} className="flex gap-2 pt-2">
            <Input
              placeholder="Buscar por CPF, nome ou e-mail"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" variant="secondary">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            {query && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setQuery('')
                  carregar()
                }}
              >
                Limpar
              </Button>
            )}
          </form>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Carregando reservas...</p>
            </div>
          ) : visiveis.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Nenhuma reserva encontrada.</p>
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
                {visiveis.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-mono text-sm">
                      {reservation.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reservation.cliente?.nome || 'Cliente'}</p>
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
                    <TableCell>{formatCurrency(reservation.total)}</TableCell>
                    <TableCell>
                      <Select
                        value={reservation.status}
                        onValueChange={(value: StatusReserva) =>
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
                      <div className="flex items-center justify-end gap-1">
                        {(reservation.status === 'PENDENTE' ||
                          reservation.status === 'CONFIRMADA') && (
                          <Button asChild size="sm">
                            <Link href={`/admin/reservas/${reservation.id}`}>
                              <KeyRound className="mr-1 h-4 w-4" />
                              Retirada
                            </Link>
                          </Button>
                        )}
                        {reservation.status === 'EM_ANDAMENTO' && (
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`/admin/reservas/${reservation.id}`}>
                              <Undo2 className="mr-1 h-4 w-4" />
                              Devolução
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/reservas/${reservation.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalhes</span>
                          </Link>
                        </Button>
                      </div>
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
