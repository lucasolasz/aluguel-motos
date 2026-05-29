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
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { formatCurrency } from '@/lib/utils'
import { Moto, MotoRequest, Categoria } from '@/lib/types'
import {
  adminGetMotos,
  adminCreateMoto,
  adminUpdateMoto,
  adminDeleteMoto,
} from '@/services/motos.service'
import { adminGetCategorias } from '@/services/categorias.service'
import { uploadMotoFoto, deleteUpload } from '@/services/upload.service'
import { MARCAS, TRANSMISSOES, ANOS } from '@/lib/constants'
import { Pencil, Plus, Trash2, X, ImageOff } from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseUnitValue(value: string, unit: string): string {
  if (!value) return ''
  const suffix = ` ${unit}`
  if (value.endsWith(suffix)) return value.slice(0, -suffix.length)
  return value
}

// ─── Unit input ──────────────────────────────────────────────────────────────

interface UnitInputProps {
  value: string
  onChange: (v: string) => void
  unit: string
  allowDecimal?: boolean
  placeholder?: string
}

function UnitInput({ value, onChange, unit, allowDecimal = false, placeholder = '0' }: UnitInputProps) {
  const display = parseUnitValue(value, unit)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value
    if (allowDecimal) {
      raw = raw.replace(/[^\d.]/g, '')
      const parts = raw.split('.')
      if (parts.length > 2) {
        raw = parts[0] + '.' + parts.slice(1).join('')
      }
    } else {
      raw = raw.replace(/\D/g, '')
    }
    if (!raw || raw === '.') {
      onChange('')
      return
    }
    onChange(`${raw} ${unit}`)
  }

  return (
    <div className="relative">
      <Input
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {unit}
      </span>
    </div>
  )
}

// ─── Currency input (reused from seguros pattern) ────────────────────────────

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

// ─── Empty form ────────────────────────────────────────────────────────────────

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

// ─── Page ──────────────────────────────────────────────────────────────────────

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFotos, setUploadingFotos] = useState(false)
  const [fotoError, setFotoError] = useState<string | null>(null)
  // Uploads feitos nesta sessão do dialog ainda não persistidos — limpáveis na hora.
  const [pendingUploads, setPendingUploads] = useState<{ url: string; key: string }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  // ─── Auto-generate nome & slug when marca/modelo change ────────────
  useEffect(() => {
    const parts = [form.marca, form.modelo].filter(Boolean)
    const nome = parts.join(' ')
    const slug = slugify(nome)
    setForm((prev) => ({
      ...prev,
      nome,
      slug,
    }))
  }, [form.marca, form.modelo])

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
    setFotoError(null)
    setPendingUploads([])
    setDialogOpen(true)
  }

  function openEdit(moto: Moto) {
    setEditingId(moto.id)
    setFotoError(null)
    setPendingUploads([])
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
      // Persistido: backend passa a ser dono dessas fotos.
      setPendingUploads([])
      setDialogOpen(false)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar moto.')
    } finally {
      setIsSaving(false)
    }
  }

  // Fecha o dialog sem salvar: remove do Garage os uploads desta sessão não persistidos.
  function handleCloseDialog() {
    pendingUploads.forEach((u) => {
      deleteUpload(u.key).catch(() => {})
    })
    setPendingUploads([])
    setDialogOpen(false)
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

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setFotoError(null)
    setUploadingFotos(true)
    try {
      for (const file of files) {
        const { url, key } = await uploadMotoFoto(file)
        setPendingUploads((prev) => [...prev, { url, key }])
        setForm((prev) => ({
          ...prev,
          fotos: [...prev.fotos, { url, ordem: prev.fotos.length, principal: prev.fotos.length === 0 }],
        }))
      }
    } catch (err) {
      setFotoError(err instanceof Error ? err.message : 'Erro ao enviar imagem.')
    } finally {
      setUploadingFotos(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeFoto(index: number) {
    const url = form.fotos[index]?.url
    const pending = pendingUploads.find((u) => u.url === url)
    if (pending) {
      // Upload desta sessão, não persistido: pode apagar do Garage na hora.
      deleteUpload(pending.key).catch(() => {})
      setPendingUploads((prev) => prev.filter((u) => u.url !== url))
    }
    // Fotos pré-existentes: backend limpa no save (diff de URLs).
    setForm((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index).map((f, i) => ({ ...f, ordem: i })),
    }))
  }

  function setPrincipal(index: number) {
    setForm((prev) => ({
      ...prev,
      fotos: prev.fotos.map((f, i) => ({ ...f, principal: i === index })),
    }))
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
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog() }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Moto' : 'Nova Moto'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1 min-w-0">
            {/* Nome (disabled, auto-generated) */}
            <div className="space-y-1.5">
              <Label>Nome (auto-gerado)</Label>
              <Input value={form.nome} disabled />
            </div>

            {/* Marca + Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Marca</Label>
                <Select
                  value={form.marca}
                  onValueChange={(v) => setForm((p) => ({ ...p, marca: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a marca" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {MARCAS.map((marca) => (
                      <SelectItem key={marca} value={marca}>
                        {marca}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Input
                  value={form.modelo}
                  onChange={(e) => setForm((p) => ({ ...p, modelo: e.target.value }))}
                  placeholder="Ex: PCX 160"
                />
              </div>
            </div>

            {/* Ano + Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ano</Label>
                <Select
                  value={String(form.ano)}
                  onValueChange={(v) => setForm((p) => ({ ...p, ano: parseInt(v, 10) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60" position="popper">
                    {ANOS.map((ano) => (
                      <SelectItem key={ano} value={String(ano)}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select
                  value={form.categoriaId}
                  onValueChange={(v) => setForm((p) => ({ ...p, categoriaId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preço + Caução */}
            <div className="grid grid-cols-2 gap-4">
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
                <UnitInput
                  value={form.motor}
                  onChange={(v) => setForm((p) => ({ ...p, motor: v }))}
                  unit="cc"
                  placeholder="157"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Potência</Label>
                <UnitInput
                  value={form.potencia}
                  onChange={(v) => setForm((p) => ({ ...p, potencia: v }))}
                  unit="cv"
                  allowDecimal
                  placeholder="15.8"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Transmissão</Label>
                <Select
                  value={form.transmissao}
                  onValueChange={(v) => setForm((p) => ({ ...p, transmissao: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {TRANSMISSOES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Capacidade do tanque</Label>
                <UnitInput
                  value={form.capacidadeTanque}
                  onChange={(v) => setForm((p) => ({ ...p, capacidadeTanque: v }))}
                  unit="L"
                  allowDecimal
                  placeholder="8.1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Altura do assento</Label>
                <UnitInput
                  value={form.alturaAssento}
                  onChange={(v) => setForm((p) => ({ ...p, alturaAssento: v }))}
                  unit="mm"
                  allowDecimal
                  placeholder="80"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Peso</Label>
                <UnitInput
                  value={form.peso}
                  onChange={(v) => setForm((p) => ({ ...p, peso: v }))}
                  unit="kg"
                  allowDecimal
                  placeholder="80"
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
                  id="disponivel"
                  checked={form.disponivel}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, disponivel: v }))}
                />
                <Label htmlFor="disponivel">Disponível</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="destaque"
                  checked={form.destaque}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, destaque: v }))}
                />
                <Label htmlFor="destaque">Destaque</Label>
              </div>
            </div>

            <Separator />

            {/* Fotos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Fotos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFotos}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {uploadingFotos ? 'Enviando...' : 'Adicionar foto'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Envie JPG, PNG ou WEBP (máx 5MB). A foto marcada como principal será usada como capa.
              </p>

              {fotoError && <p className="text-sm text-destructive">{fotoError}</p>}

              {form.fotos.length === 0 && !uploadingFotos && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma foto adicionada.
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.fotos.map((foto, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border">
                    <div className="relative aspect-video bg-muted">
                      <Image
                        src={foto.url}
                        alt={`Foto ${index + 1}`}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-1 p-1.5">
                      <Button
                        type="button"
                        variant={foto.principal ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 flex-1 text-xs"
                        onClick={() => setPrincipal(index)}
                      >
                        {foto.principal ? 'Principal' : 'Tornar principal'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeFoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleCloseDialog}>
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
