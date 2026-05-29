'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { Moto, MotoRequest, Categoria } from '@/lib/types'
import {
  adminGetMotos,
  adminCreateMoto,
  adminUpdateMoto,
  adminDeleteMoto,
} from '@/services/motos.service'
import { adminGetCategorias } from '@/services/categorias.service'
import { Pencil, Plus, Trash2, X, ImageOff } from 'lucide-react'

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

// ─── Empty form ─────────────────────────────────────────────────────────────

const emptyForm = (): MotoRequest => ({
  nome: '',
  slug: '',
  marca: '',
  modelo: '',
  ano: new Date().getFullYear(),
  precoPorDia: 0,
  caucao: 0,
  motor: '',
  potencia: '',
  transmissao: '',
  capacidadeTanque: '',
  alturaAssento: '',
  peso: '',
  itens: '',
  disponivel: true,
  destaque: false,
  categoriaId: '',
  fotos: [],
})

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminMotorcyclesPage() {
  const [motos, setMotos] = useState<Moto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<MotoRequest>(emptyForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [motosData, categoriasData] = await Promise.all([
        adminGetMotos(),
        adminGetCategorias(),
      ])
      setMotos(motosData)
      setCategorias(categoriasData)
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

  function openEdit(moto: Moto) {
    setEditingId(moto.id)
    setForm({
      nome: moto.nome,
      slug: moto.slug,
      marca: moto.marca,
      modelo: moto.modelo,
      ano: moto.ano,
      precoPorDia: moto.precoPorDia,
      caucao: moto.caucao,
      motor: moto.motor,
      potencia: moto.potencia,
      transmissao: moto.transmissao,
      capacidadeTanque: moto.capacidadeTanque,
      alturaAssento: moto.alturaAssento,
      peso: moto.peso,
      itens: moto.itens.join(', '),
      disponivel: moto.disponivel,
      destaque: moto.destaque ?? false,
      categoriaId: moto.categoria?.id ?? '',
      fotos: moto.fotos.map((f) => ({ url: f.url, ordem: f.ordem, principal: f.principal })),
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
        const updated = await adminUpdateMoto(editingId, form)
        setMotos((prev) => prev.map((m) => (m.id === editingId ? updated : m)))
      } else {
        const created = await adminCreateMoto(form)
        setMotos((prev) => [...prev, created])
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar moto.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      await adminDeleteMoto(deletingId)
      setMotos((prev) => prev.filter((m) => m.id !== deletingId))
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteDialogOpen(false)
      setDeletingId(null)
    }
  }

  function addFoto() {
    setForm((prev) => ({
      ...prev,
      fotos: [...prev.fotos, { url: '', ordem: prev.fotos.length, principal: prev.fotos.length === 0 }],
    }))
  }

  function removeFoto(index: number) {
    setForm((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index).map((f, i) => ({ ...f, ordem: i })),
    }))
  }

  function updateFoto(index: number, url: string) {
    setForm((prev) => ({
      ...prev,
      fotos: prev.fotos.map((f, i) => (i === index ? { ...f, url } : f)),
    }))
  }

  function setPrincipal(index: number) {
    setForm((prev) => ({
      ...prev,
      fotos: prev.fotos.map((f, i) => ({ ...f, principal: i === index })),
    }))
  }

  function handleIntegerField(field: keyof MotoRequest, value: string) {
    const digitsOnly = value.replace(/\D/g, '')
    setForm((prev) => ({ ...prev, [field]: parseInt(digitsOnly || '0', 10) }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Motos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie as motos da frota
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Moto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frota de Motos</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${motos.length} motos cadastradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Carregando motos...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço/Dia</TableHead>
                  <TableHead>Caução</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Destaque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {motos.map((moto) => (
                  <TableRow key={moto.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-14 overflow-hidden rounded bg-muted">
                          {moto.fotos[0]?.url ? (
                            <Image
                              src={moto.fotos[0].url}
                              alt={moto.nome}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{moto.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {moto.marca} {moto.modelo} {moto.ano}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{moto.categoria?.nome}</TableCell>
                    <TableCell>{formatCurrency(moto.precoPorDia)}</TableCell>
                    <TableCell>{formatCurrency(moto.caucao)}</TableCell>
                    <TableCell>
                      <Badge variant={moto.disponivel ? 'default' : 'secondary'}>
                        {moto.disponivel ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {moto.destaque ? (
                        <Badge>Destaque</Badge>
                      ) : (
                        <Badge variant="outline">—</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(moto)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDelete(moto.id)}>
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
              {editingId ? 'Editar Moto' : 'Nova Moto'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1 min-w-0">
            {/* Nome + Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Honda PCX 160"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="Ex: honda-pcx-160"
                />
              </div>
            </div>

            {/* Marca + Modelo + Ano */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Marca</Label>
                <Input
                  value={form.marca}
                  onChange={(e) => setForm((p) => ({ ...p, marca: e.target.value }))}
                  placeholder="Ex: Honda"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Input
                  value={form.modelo}
                  onChange={(e) => setForm((p) => ({ ...p, modelo: e.target.value }))}
                  placeholder="Ex: PCX 160"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ano</Label>
                <Input
                  value={form.ano === 0 ? '' : String(form.ano)}
                  onChange={(e) => handleIntegerField('ano', e.target.value)}
                  placeholder="2024"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Categoria + Preço + Caução */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select
                  value={form.categoriaId}
                  onValueChange={(v) => setForm((p) => ({ ...p, categoriaId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Preço por dia</Label>
                <CurrencyInput
                  value={form.precoPorDia}
                  onChange={(v) => setForm((p) => ({ ...p, precoPorDia: v }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Caução</Label>
                <CurrencyInput
                  value={form.caucao}
                  onChange={(v) => setForm((p) => ({ ...p, caucao: v }))}
                />
              </div>
            </div>

            {/* Especificações */}
            <Separator />
            <div>
              <Label className="text-sm font-semibold">Especificações</Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Motor</Label>
                <Input
                  value={form.motor}
                  onChange={(e) => setForm((p) => ({ ...p, motor: e.target.value }))}
                  placeholder="Ex: 160cc"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Potência</Label>
                <Input
                  value={form.potencia}
                  onChange={(e) => setForm((p) => ({ ...p, potencia: e.target.value }))}
                  placeholder="Ex: 16,5 cv"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Transmissão</Label>
                <Input
                  value={form.transmissao}
                  onChange={(e) => setForm((p) => ({ ...p, transmissao: e.target.value }))}
                  placeholder="Ex: CVT"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Capacidade do tanque</Label>
                <Input
                  value={form.capacidadeTanque}
                  onChange={(e) => setForm((p) => ({ ...p, capacidadeTanque: e.target.value }))}
                  placeholder="Ex: 8,1 L"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Altura do assento</Label>
                <Input
                  value={form.alturaAssento}
                  onChange={(e) => setForm((p) => ({ ...p, alturaAssento: e.target.value }))}
                  placeholder="Ex: 764 mm"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Peso</Label>
                <Input
                  value={form.peso}
                  onChange={(e) => setForm((p) => ({ ...p, peso: e.target.value }))}
                  placeholder="Ex: 130 kg"
                />
              </div>
            </div>

            {/* Itens */}
            <div className="space-y-1.5">
              <Label>Itens incluídos</Label>
              <Textarea
                value={form.itens}
                onChange={(e) => setForm((p) => ({ ...p, itens: e.target.value }))}
                placeholder="Separe por vírgula: Capacete, Luvas, Macacão..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Separe os itens por vírgula. Eles serão exibidos como uma lista na página da moto.
              </p>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.disponivel}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, disponivel: v }))}
                />
                <Label>Disponível</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.destaque}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, destaque: v }))}
                />
                <Label>Destaque</Label>
              </div>
            </div>

            <Separator />

            {/* Fotos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Fotos</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFoto}>
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar URL
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Upload de imagens desabilitado. Adicione URLs manualmente. A primeira foto definida como principal será usada como capa.
              </p>

              {form.fotos.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma foto adicionada.
                </p>
              )}

              <div className="space-y-2">
                {form.fotos.map((foto, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      className="flex-1"
                      value={foto.url}
                      onChange={(e) => updateFoto(index, e.target.value)}
                      placeholder="https://..."
                    />
                    <Button
                      type="button"
                      variant={foto.principal ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPrincipal(index)}
                      className="shrink-0"
                    >
                      {foto.principal ? 'Principal' : 'Tornar principal'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFoto(index)}
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
              Essa ação não pode ser desfeita. A moto será permanentemente excluída.
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
