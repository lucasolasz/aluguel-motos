'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Trash2 } from 'lucide-react'
import { getMeusCartoes, deletarCartao } from '@/services/cartao.service'
import type { Cartao } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletando, setDeletando] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')

  useEffect(() => {
    getMeusCartoes()
      .then(setCartoes)
      .catch(() => setError('Erro ao carregar cartões.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) return
    setDeletando(id)
    try {
      await deletarCartao(id)
      setCartoes((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      setDialogMessage(err?.message || 'Erro ao excluir cartão.')
      setDialogOpen(true)
    } finally {
      setDeletando(null)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meus Cartões</h1>
        <p className="mt-1 text-muted-foreground">Visualize e gerencie seus cartões cadastrados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cartões Cadastrados</CardTitle>
          <CardDescription>Cartões salvos durante suas reservas</CardDescription>
        </CardHeader>
        <CardContent>
          {cartoes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">Nenhum cartão cadastrado.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cartões são salvos automaticamente ao realizar uma reserva.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartoes.map((cartao) => (
                <div
                  key={cartao.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cartao.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {cartao.numeroMascarado} &middot; Validade {cartao.validade}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={deletando === cartao.id || cartao.vinculadoAReservas}
                    onClick={() => handleDelete(cartao.id)}
                    title={cartao.vinculadoAReservas ? 'Cartão vinculado a reservas' : 'Excluir'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erro</AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
