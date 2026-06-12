'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  type Multa,
  type StatusMulta,
  TIPO_MULTA_LABELS,
  STATUS_MULTA_LABELS,
} from '@/lib/atendimento-types'
import { adminListarTodasMultas } from '@/services/multas.service'

const STATUS_BADGE: Record<StatusMulta, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  COBRADA: 'bg-green-100 text-green-800 border-green-300',
  CANCELADA: 'bg-red-100 text-red-800 border-red-300',
}

export default function MultasPage() {
  const [multas, setMultas] = useState<Multa[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<StatusMulta | 'TODOS'>('TODOS')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      setMultas(await adminListarTodasMultas())
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar multas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const filtradas = filtroStatus === 'TODOS'
    ? multas
    : multas.filter((m) => m.status === filtroStatus)

  const totalPendente = multas
    .filter((m) => m.status === 'PENDENTE')
    .reduce((acc, m) => acc + m.valor, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Multas</h1>
        <p className="text-sm text-muted-foreground">
          Todas as multas lançadas vinculadas a reservas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de multas</CardDescription>
            <CardTitle className="text-2xl">{multas.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-2xl text-yellow-700">
              {multas.filter((m) => m.status === 'PENDENTE').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valor pendente</CardDescription>
            <CardTitle className="text-2xl text-destructive">
              {formatCurrency(totalPendente)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Listagem</CardTitle>
          <Select
            value={filtroStatus}
            onValueChange={(v) => setFiltroStatus(v as StatusMulta | 'TODOS')}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              {(Object.entries(STATUS_MULTA_LABELS) as [StatusMulta, string][]).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : erro ? (
            <p className="text-sm text-destructive">{erro}</p>
          ) : filtradas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma multa encontrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reserva</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Lançada por</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.reservaId.slice(0, 8)}</TableCell>
                    <TableCell>{TIPO_MULTA_LABELS[m.tipo]}</TableCell>
                    <TableCell className="max-w-xs truncate">{m.descricao}</TableCell>
                    <TableCell className="font-medium text-destructive">
                      {formatCurrency(m.valor)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_BADGE[m.status]}`}>
                        {STATUS_MULTA_LABELS[m.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(m.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{m.criadoPor ?? '—'}</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/reservas/${m.reservaId}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
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
