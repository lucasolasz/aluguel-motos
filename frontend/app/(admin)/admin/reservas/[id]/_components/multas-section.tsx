'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { IMaskInput } from 'react-imask'
import { Plus, Pencil, Ban, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  type Multa,
  type TipoMulta,
  type StatusMulta,
  TIPO_MULTA_LABELS,
  STATUS_MULTA_LABELS,
} from '@/lib/atendimento-types'
import {
  adminCriarMulta,
  adminEditarMulta,
  adminCancelarMulta,
} from '@/services/multas.service'

const STATUS_BADGE: Record<StatusMulta, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  COBRADA: 'bg-green-100 text-green-800 border-green-300',
  CANCELADA: 'bg-red-100 text-red-800 border-red-300',
}

interface FormState {
  tipo: TipoMulta | ''
  descricao: string
  valor: string
  observacoes: string
  status: StatusMulta | ''
}

const FORM_INICIAL: FormState = { tipo: '', descricao: '', valor: '', observacoes: '', status: '' }

interface MultasSectionProps {
  multas: Multa[]
  reservaId: string
  onRefresh: () => Promise<void>
}

export default function MultasSection({ multas, reservaId, onRefresh }: MultasSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Multa | null>(null)
  const [cancelandoId, setCancelandoId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(FORM_INICIAL)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const abrirCriar = () => {
    setEditando(null)
    setForm(FORM_INICIAL)
    setErro(null)
    setDialogOpen(true)
  }

  const abrirEditar = (m: Multa) => {
    setEditando(m)
    setForm({
      tipo: m.tipo,
      descricao: m.descricao,
      valor: String(m.valor).replace('.', ','),
      observacoes: m.observacoes ?? '',
      status: m.status,
    })
    setErro(null)
    setDialogOpen(true)
  }

  const parseValor = (v: string): number => {
    const raw = v.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(raw) || 0
  }

  const salvar = async () => {
    if (!form.tipo || !form.descricao.trim() || !form.valor) {
      setErro('Tipo, descrição e valor são obrigatórios.')
      return
    }
    setErro(null)
    setSaving(true)
    try {
      if (editando) {
        await adminEditarMulta(reservaId, editando.id, {
          tipo: form.tipo as TipoMulta,
          descricao: form.descricao,
          valor: parseValor(form.valor),
          observacoes: form.observacoes || undefined,
          status: (form.status as StatusMulta) || undefined,
        })
      } else {
        await adminCriarMulta(reservaId, {
          tipo: form.tipo as TipoMulta,
          descricao: form.descricao,
          valor: parseValor(form.valor),
          observacoes: form.observacoes || undefined,
        })
      }
      setDialogOpen(false)
      await onRefresh()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar multa')
    } finally {
      setSaving(false)
    }
  }

  const confirmarCancelar = async () => {
    if (!cancelandoId) return
    setSaving(true)
    try {
      await adminCancelarMulta(reservaId, cancelandoId)
      await onRefresh()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao cancelar multa')
    } finally {
      setSaving(false)
      setCancelandoId(null)
    }
  }

  return (
    <div className="space-y-3">
      {multas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma multa lançada.</p>
      ) : (
        <div className="space-y-2">
          {multas.map((m) => (
            <div key={m.id} className="flex items-start justify-between rounded-md border p-3 text-sm">
              <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{TIPO_MULTA_LABELS[m.tipo]}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${STATUS_BADGE[m.status]}`}
                  >
                    {STATUS_MULTA_LABELS[m.status]}
                  </Badge>
                  <span className="font-medium text-destructive">{formatCurrency(m.valor)}</span>
                </div>
                <p className="text-muted-foreground truncate">{m.descricao}</p>
                {m.observacoes && (
                  <p className="text-xs text-muted-foreground">{m.observacoes}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {m.criadoPor ? `${m.criadoPor} · ` : ''}{formatDate(m.createdAt)}
                </p>
              </div>
              {m.status !== 'CANCELADA' && (
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => abrirEditar(m)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setCancelandoId(m.id)}
                  >
                    <Ban className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Button size="sm" variant="outline" onClick={abrirCriar}>
        <Plus className="mr-2 h-3.5 w-3.5" /> Nova multa
      </Button>

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!saving) { setDialogOpen(open) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar multa' : 'Nova multa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo <span className="text-destructive">*</span></Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as TipoMulta }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TIPO_MULTA_LABELS) as [TipoMulta, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição <span className="text-destructive">*</span></Label>
              <Input
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Ex: Arranhão no para-choque dianteiro"
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor <span className="text-destructive">*</span></Label>
              <IMaskInput
                mask={Number}
                radix=","
                thousandsSeparator="."
                prefix="R$ "
                scale={2}
                padFractionalZeros
                normalizeZeros
                value={form.valor}
                onAccept={(v: string) => setForm((f) => ({ ...f, valor: v }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="R$ 0,00"
              />
            </div>

            {editando && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as StatusMulta }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Manter atual" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(STATUS_MULTA_LABELS) as [StatusMulta, string][]).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                placeholder="Detalhes adicionais..."
                rows={2}
                maxLength={1000}
              />
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={saving} onClick={salvar}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editando ? 'Salvar alterações' : 'Lançar multa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação cancelamento */}
      <AlertDialog open={!!cancelandoId} onOpenChange={(open) => { if (!open) setCancelandoId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar multa?</AlertDialogTitle>
            <AlertDialogDescription>
              A multa ficará registrada com status Cancelada. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmarCancelar}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cancelar multa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
