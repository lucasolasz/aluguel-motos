'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { SeguroAdmin, SeguroRequest, TipoCobertura } from '@/lib/types'
import {
  adminGetSeguros,
  adminCreateSeguro,
  adminUpdateSeguro,
  adminDeleteSeguro,
} from '@/services/seguros.service'
import { Pencil, Plus, Trash2, X } from 'lucide-react'

// ─── Currency input ──────────────────────────────────────────────────────────

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

  // Sync display when parent resets the form (e.g. openCreate / openEdit)
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

// ─── Page ─────────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<TipoCobertura, string> = {
  INCLUSO: 'Incluso',
  PARCIAL: 'Parcial',
  NAO_INCLUSO: 'Não incluso',
}

const emptyForm = (): SeguroRequest => ({
  nome: '',
  descricao: '',
  valorOriginal: 0,
  valorComDesconto: 0,
  percentualDesconto: 0,
  valorTotalPacote: 0,
  maxParcelasSemJuros: 1,
  recomendado: false,
  ativo: true,
  coberturas: [],
})

export default function AdminSegurosPage() {
  const [seguros, setSeguros] = useState<SeguroAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<SeguroRequest>(emptyForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    loadSeguros()
  }, [])

  async function loadSeguros() {
    try {
      const data = await adminGetSeguros()
      setSeguros(data)
    } catch (err) {
      console.error(err)
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

  function openEdit(seguro: SeguroAdmin) {
    setEditingId(seguro.id)
    setForm({
      nome: seguro.nome,
      descricao: seguro.descricao,
      valorOriginal: seguro.valorOriginal,
      valorComDesconto: seguro.valorComDesconto,
      percentualDesconto: seguro.percentualDesconto,
      valorTotalPacote: seguro.valorTotalPacote,
      maxParcelasSemJuros: seguro.maxParcelasSemJuros,
      recomendado: seguro.recomendado,
      ativo: seguro.ativo,
      coberturas: seguro.coberturas.map((c) => ({ nome: c.nome, tipo: c.tipo })),
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
        const updated = await adminUpdateSeguro(editingId, form)
        setSeguros((prev) => prev.map((s) => (s.id === editingId ? updated : s)))
      } else {
        const created = await adminCreateSeguro(form)
        setSeguros((prev) => [...prev, created])
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar seguro.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      await adminDeleteSeguro(deletingId)
      setSeguros((prev) => prev.filter((s) => s.id !== deletingId))
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteDialogOpen(false)
      setDeletingId(null)
    }
  }

  function addCobertura() {
    setForm((prev) => ({
      ...prev,
      coberturas: [...prev.coberturas, { nome: '', tipo: 'INCLUSO' }],
    }))
  }

  function removeCobertura(index: number) {
    setForm((prev) => ({
      ...prev,
      coberturas: prev.coberturas.filter((_, i) => i !== index),
    }))
  }

  function updateCobertura(index: number, field: 'nome' | 'tipo', value: string) {
    setForm((prev) => ({
      ...prev,
      coberturas: prev.coberturas.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }))
  }

  function handleIntegerField(field: keyof SeguroRequest, value: string) {
    const digitsOnly = value.replace(/\D/g, '')
    setForm((prev) => ({ ...prev, [field]: parseInt(digitsOnly || '0', 10) }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seguros</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie os planos de seguro disponíveis
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Seguro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos de Seguro</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${seguros.length} seguros cadastrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Carregando seguros...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor original</TableHead>
                  <TableHead>Valor c/ desconto</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Recomendado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seguros.map((seguro) => (
                  <TableRow key={seguro.id}>
                    <TableCell className="font-medium">{seguro.nome}</TableCell>
                    <TableCell>{formatCurrency(seguro.valorOriginal)}</TableCell>
                    <TableCell>{formatCurrency(seguro.valorComDesconto)}</TableCell>
                    <TableCell>{seguro.percentualDesconto}%</TableCell>
                    <TableCell>até {seguro.maxParcelasSemJuros}x</TableCell>
                    <TableCell>
                      {seguro.recomendado ? (
                        <Badge>Sim</Badge>
                      ) : (
                        <Badge variant="outline">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={seguro.ativo ? 'default' : 'secondary'}>
                        {seguro.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(seguro)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDelete(seguro.id)}>
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

      {/* ─── Create / Edit Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Seguro' : 'Novo Seguro'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1 min-w-0">
            {/* Nome + Descrição */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Seguro Completo"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Input
                  value={form.descricao}
                  onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                  placeholder="Breve descrição do plano"
                />
              </div>
            </div>

            {/* Preços — 4 colunas */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label>Valor original</Label>
                <CurrencyInput
                  value={form.valorOriginal}
                  onChange={(v) => setForm((p) => ({ ...p, valorOriginal: v }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor com desconto</Label>
                <CurrencyInput
                  value={form.valorComDesconto}
                  onChange={(v) => setForm((p) => ({ ...p, valorComDesconto: v }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Desconto (%)</Label>
                <Input
                  value={form.percentualDesconto === 0 ? '' : String(form.percentualDesconto)}
                  onChange={(e) => handleIntegerField('percentualDesconto', e.target.value)}
                  placeholder="0"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor total do pacote</Label>
                <CurrencyInput
                  value={form.valorTotalPacote}
                  onChange={(v) => setForm((p) => ({ ...p, valorTotalPacote: v }))}
                />
              </div>
            </div>

            {/* Parcelas + Flags numa linha */}
            <div className="flex items-end gap-6">
              <div className="space-y-1.5 w-40">
                <Label>Máx. parcelas s/ juros</Label>
                <Input
                  value={form.maxParcelasSemJuros === 0 ? '' : String(form.maxParcelasSemJuros)}
                  onChange={(e) => handleIntegerField('maxParcelasSemJuros', e.target.value)}
                  placeholder="1"
                  inputMode="numeric"
                />
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                <Switch
                  checked={form.recomendado}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, recomendado: v }))}
                />
                <Label>Recomendado</Label>
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))}
                />
                <Label>Ativo</Label>
              </div>
            </div>

            <Separator />

            {/* Coberturas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Coberturas</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCobertura}>
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar cobertura
                </Button>
              </div>

              {form.coberturas.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma cobertura adicionada.
                </p>
              )}

              <div className="space-y-2">
                {form.coberturas.map((cob, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      className="flex-1"
                      value={cob.nome}
                      onChange={(e) => updateCobertura(index, 'nome', e.target.value)}
                      placeholder="Nome da cobertura"
                    />
                    <Select
                      value={cob.tipo}
                      onValueChange={(v) => updateCobertura(index, 'tipo', v)}
                    >
                      <SelectTrigger className="w-40 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCLUSO">{TIPO_LABELS.INCLUSO}</SelectItem>
                        <SelectItem value="PARCIAL">{TIPO_LABELS.PARCIAL}</SelectItem>
                        <SelectItem value="NAO_INCLUSO">{TIPO_LABELS.NAO_INCLUSO}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCobertura(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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

      {/* ─── Delete Confirmation ─── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O seguro será permanentemente excluído.
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
