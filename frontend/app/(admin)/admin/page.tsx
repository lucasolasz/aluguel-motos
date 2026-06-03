'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bike, Calendar, DollarSign, Users } from 'lucide-react'
import { apiFetch } from '@/lib/auth'
import { logError } from '@/lib/logger'
import { formatCurrency } from '@/lib/utils'

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
  status: string
  dataRetirada: string
  dataDevolucao: string
  totalDias: number
  moto: MotoResumo
  cliente: ClienteResumo
  total: number
  createdAt: string
}

interface Moto {
  id: string
  nome: string
  precoPorDia: number
  marca: string
  ano: number
  fotos: { url: string }[]
  categoria: { nome: string }
}

interface DashboardData {
  totalMotos: number
  totalReservas: number
  totalClientes: number
  receitaMes: number
  recentReservations: Reservation[]
  popularMotos: Moto[]
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<Moto[]>('/api/motos'),
      apiFetch<Reservation[]>('/api/admin/reservas'),
      apiFetch<{ id: string }[]>('/api/admin/clientes'),
    ])
      .then(([motos, reservas, clientes]) => {
        const receitaMes = reservas
          .filter((r: Reservation) => r.status === 'FINALIZADA')
          .reduce((sum: number, r: Reservation) => sum + Number(r.total), 0)

        setData({
          totalMotos: motos.length,
          totalReservas: reservas.length,
          totalClientes: clientes.length,
          receitaMes,
          recentReservations: reservas.slice(0, 3),
          popularMotos: motos.slice(0, 3),
        })
      })
      .catch(logError)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total de Motos',
      value: data.totalMotos.toString(),
      icon: Bike,
      description: 'Motos na frota',
    },
    {
      name: 'Reservas',
      value: data.totalReservas.toString(),
      icon: Calendar,
      description: 'Total de reservas',
    },
    {
      name: 'Receita',
      value: formatCurrency(data.receitaMes),
      icon: DollarSign,
      description: 'Este mês',
    },
    {
      name: 'Clientes',
      value: data.totalClientes.toString(),
      icon: Users,
      description: 'Clientes ativos',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Visão geral do sistema de aluguel
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reservas Recentes</CardTitle>
            <CardDescription>Últimas reservas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{reservation.moto?.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.cliente?.nome}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(Number(reservation.total))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.totalDias} dias
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motos Populares</CardTitle>
            <CardDescription>Motos mais alugadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.popularMotos.map((moto, index) => (
                <div
                  key={moto.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{moto.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {moto.categoria?.nome}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(moto.precoPorDia)}/dia
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}