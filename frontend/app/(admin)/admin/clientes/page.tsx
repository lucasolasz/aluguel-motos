'use client'

import { useState, useEffect } from 'react'
import { logError } from '@/lib/logger'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { apiFetch } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

interface Cliente {
  id: string
  username: string
  nomeCompleto: string | null
  telefone: string | null
  cpf: string | null
  numeroCnh: string | null
  fotoPerfil: string | null
  createdAt: string
  totalReservas: number
  grupos: string[]
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<Cliente[]>('/api/admin/clientes')
      .then(setClientes)
      .catch(logError)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Gerenciar Clientes
        </h1>
        <p className="mt-1 text-muted-foreground">
          Visualize todos os clientes cadastrados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${clientes.length} clientes no sistema`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Carregando clientes...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>CNH</TableHead>
                  <TableHead>Grupos</TableHead>
                  <TableHead>Reservas</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {cliente.nomeCompleto || 'Não informado'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{cliente.username}</TableCell>
                    <TableCell>{cliente.telefone || '-'}</TableCell>
                    <TableCell>{cliente.cpf || '-'}</TableCell>
                    <TableCell>{cliente.numeroCnh || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {cliente.grupos.map((grupo) => (
                          <Badge key={grupo} variant="outline">
                            {grupo}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {cliente.totalReservas}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(cliente.createdAt)}
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