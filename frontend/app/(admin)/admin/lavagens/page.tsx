'use client'

import { useState, useEffect, useRef } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { LavagemServico, LavagemServicoRequest } from '@/lib/types'
import {
  adminGetLavagens,
  adminCreateLavagem,
  adminUpdateLavagem,
  adminDeleteLavagem,
} from '@/services/lavagens.service'
import { Pencil, Plus, Trash2 } from 'lucide-react'

function numberToDisplay(n: number): string {
  if (!n) return ''
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface CurrencyInputProps {
  value: number
  onChange: (v: number) => void
  placeholder?: string
}

function CurrencyInput({ value, onChange, placeholder = '0,00' }: CurrencyInputProps) {
  const [display, setDisplay] = useState(numberToDisplay(value))
  const skipEffect = useRef(false)

  useEffect(() => {
    if (skipEffect.current) {
      skipEffect.current = false
      return
    }
    setDisplay(numberToDisplay(value))
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      setDisplay('')
      skipEffect.current = true
      onChange(0)
      return
    }
    const cents = parseInt(raw, 10)
    const numValue = parseFloat((cents / 100).toFixed(2))
    const formatted = numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    setDisplay(formatted)
    skipEffect.current = true
    onChange(numValue)
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        R$
      </span>
      <Input
        className="pl-9"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode="numeric"
      />
    </div>
  )
}

const emptyForm = (): LavagemServicoRequest => ({
  nome: '',
  descricao: '',
  valor: 0,
  tipoCobranca: 'VALOR_UNICO',
  ativo: true,
})

export default function AdminLavagensPage() {
  const [lavagens, setLavagens] = useState<LavagemServico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<LavagemServicoRequest>(emptyForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    loadLavagens()
  }, [])

  async function loadLavagens() {
    try {
      const data = await adminGetLavagens()
      setLavagens(data)
    } catch (err) {
      logError(err)
    } finally {
      setIsLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setSaveError(null)
    setDialogOpen(true)
  }

  function openEdit(lavagem: LavagemServico) {
    setEditingId(lavagem.id)
    setForm({
      nome: lavagem.nome,
      descricao: lavagem.descricao,
      valor: lavagem.valor,
      tipoCobranca: lavagem.tipoCobranca,
      ativo: lavagem.ativo,
    })
    setSaveError(null)
    setDialogOpen(true)
  }

  function openDelete(id: string) {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  async function handleSave() {
    setSaveError(null)
    setIsSaving(true)
    try {
      if (editingId) {
        const updated = await adminUpdateLavagem(editingId, form)
        setLavagens((prev) => prev.map((l) => (l.id === editingId ? updated : l)))
      } else {
        const created = await adminCreateLavagem(form)
        setLavagens((prev) => [...prev, created])
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar serviço de lavagem.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      await adminDeleteLavagem(deletingId)
      setLavagens((prev) => prev.filter((l) => l.id !== deletingId))
    } catch (err) {
      logError(err)
    } finally {
      setDeleteDialogOpen(false)
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lavagem</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie os serviços de limpeza disponíveis
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Serviços de Lavagem</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${lavagens.length} serviços cadastrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Carregando serviços...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Cobrança</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lavagens.map((lavagem) => (
                  <TableRow key={lavagem.id}>
                    <TableCell className="font-medium">{lavagem.nome}</TableCell>
                    <TableCell>{formatCurrency(lavagem.valor)}</TableCell>
                    <TableCell>Valor único</TableCell>
                    <TableCell>
                      <Badge variant={lavagem.ativo ? 'default' : 'secondary'}>
                        {lavagem.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(lavagem)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDelete(lavagem.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1 min-w-0">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Ex: Limpeza Garantida"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                placeholder="Descrição do serviço"
                rows={4}
              />
            </div>

            <div className="flex items-end gap-6">
              <div className="space-y-1.5 w-40">
                <Label>Valor</Label>
                <CurrencyInput
                  value={form.valor}
                  onChange={(v) => setForm((p) => ({ ...p, valor: v }))}
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))}
                />
                <Label>Ativo</Label>
              </div>
            </div>

            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O serviço será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
