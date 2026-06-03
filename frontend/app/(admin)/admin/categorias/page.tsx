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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Categoria, CategoriaRequest } from '@/lib/types'
import {
  adminGetCategorias,
  adminCreateCategoria,
  adminUpdateCategoria,
  adminDeleteCategoria,
} from '@/services/categorias.service'
import { Pencil, Plus, Trash2 } from 'lucide-react'

const emptyForm = (): CategoriaRequest => ({
  nome: '',
  descricao: '',
  slug: '',
  imageUrl: '',
})

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoriaRequest>(emptyForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    loadCategorias()
  }, [])

  async function loadCategorias() {
    try {
      const data = await adminGetCategorias()
      setCategorias(data)
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

  function openEdit(categoria: Categoria) {
    setEditingId(categoria.id)
    setForm({
      nome: categoria.nome,
      descricao: categoria.descricao,
      slug: categoria.slug,
      imageUrl: categoria.imageUrl,
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
        const updated = await adminUpdateCategoria(editingId, form)
        setCategorias((prev) => prev.map((c) => (c.id === editingId ? updated : c)))
      } else {
        const created = await adminCreateCategoria(form)
        setCategorias((prev) => [...prev, created])
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar categoria.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      await adminDeleteCategoria(deletingId)
      setCategorias((prev) => prev.filter((c) => c.id !== deletingId))
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
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie as categorias de motos disponíveis
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categorias de Motos</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${categorias.length} categorias cadastradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Carregando categorias...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Imagem URL</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell className="font-medium">{categoria.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{categoria.slug}</TableCell>
                    <TableCell className="max-w-xs truncate">{categoria.descricao}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {categoria.imageUrl || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(categoria)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDelete(categoria.id)}>
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
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1 min-w-0">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Ex: Scooter Premium"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="Ex: scooter-premium"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                placeholder="Descrição da categoria"
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label>URL da Imagem</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
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
              Essa ação não pode ser desfeita. A categoria será permanentemente excluída.
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