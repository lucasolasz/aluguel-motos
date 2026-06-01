'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Progress,
} from '@/components/ui/progress'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { uploadVistoriaFoto } from '@/services/upload.service'
import { adminRegistrarVistoria } from '@/services/reservas.service'
import {
  NIVEL_COMBUSTIVEL_LABELS,
  type NivelCombustivel,
  type ReservaDetalhe,
  type TipoVistoria,
} from '@/lib/atendimento-types'
import { ImageDialog } from './image-dialog'

interface VistoriaFormProps {
  reservaId: string
  tipo: TipoVistoria
  onDone: (d: ReservaDetalhe) => void
}

export default function VistoriaForm({ reservaId, tipo, onDone }: VistoriaFormProps) {
  const [km, setKm] = useState('')
  const [nivel, setNivel] = useState<NivelCombustivel | ''>('')
  const [observacoes, setObservacoes] = useState('')
  const [fotos, setFotos] = useState<string[]>([])
  const [pendingFiles, setPendingFiles] = useState<{ file: File; previewUrl: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setErro(null)

    const newEntries: { file: File; previewUrl: string }[] = []
    const newUrls: string[] = []

    Array.from(files).forEach((file) => {
      const previewUrl = URL.createObjectURL(file)
      newEntries.push({ file, previewUrl })
      newUrls.push(previewUrl)
    })

    setPendingFiles((prev) => [...prev, ...newEntries])
    setFotos((prev) => [...prev, ...newUrls])

    if (inputRef.current) inputRef.current.value = ''
  }

  const removeFoto = (index: number) => {
    const url = fotos[index]
    const pendingIndex = pendingFiles.findIndex((pf) => pf.previewUrl === url)
    if (pendingIndex !== -1) {
      URL.revokeObjectURL(pendingFiles[pendingIndex].previewUrl)
      setPendingFiles((prev) => prev.filter((_, i) => i !== pendingIndex))
    }
    setFotos((prev) => prev.filter((_, i) => i !== index))
  }

  const submit = async () => {
    setErro(null)

    let finalFotos = [...fotos]

    if (pendingFiles.length > 0) {
      setUploading(true)
      setUploadProgress({ current: 0, total: pendingFiles.length })
      const uploadedKeys: string[] = []

      try {
        const fotosNovas: string[] = []
        for (let i = 0; i < pendingFiles.length; i++) {
          const res = await uploadVistoriaFoto(pendingFiles[i].file, reservaId)
          uploadedKeys.push(res.key)
          fotosNovas.push(res.url)
          setUploadProgress({ current: i + 1, total: pendingFiles.length })
        }

        const existingUrls = fotos.filter((u) => !u.startsWith('blob:'))
        finalFotos = [...existingUrls, ...fotosNovas]
        setFotos(finalFotos)

        pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.previewUrl))
        setPendingFiles([])
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha no upload de fotos')
        return
      } finally {
        setUploading(false)
        setUploadProgress(null)
      }
    }

    setSaving(true)
    try {
      const d = await adminRegistrarVistoria(reservaId, {
        tipo,
        kmRegistrado: km ? Number(km) : null,
        nivelCombustivel: nivel || null,
        observacoes: observacoes || null,
        fotos: finalFotos,
      })
      onDone(d)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar vistoria')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`km-${tipo}`}>Quilometragem (km)</Label>
          <Input
            id={`km-${tipo}`}
            type="number"
            inputMode="numeric"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            placeholder="Ex: 12340"
          />
        </div>
        <div className="space-y-2">
          <Label>Nível de combustível</Label>
          <Select value={nivel} onValueChange={(v: NivelCombustivel) => setNivel(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(NIVEL_COMBUSTIVEL_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`obs-${tipo}`}>Observações</Label>
        <Textarea
          id={`obs-${tipo}`}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Avarias, riscos, estado geral..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Fotos da vistoria</Label>
        <div className="flex flex-wrap gap-3">
          {fotos.map((url, i) => (
            <div key={url} className="relative h-24 w-24 overflow-hidden rounded-md border">
              <ImageDialog src={url} alt={`Foto ${i + 1}`}>
                {url.startsWith('blob:') ? (
                  <img src={url} alt={`Foto ${i + 1}`} className="h-24 w-24 object-cover" />
                ) : (
                  <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="96px" />
                )}
              </ImageDialog>
              <button
                type="button"
                onClick={() => removeFoto(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || saving}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:bg-muted"
          >
            {uploading || saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs">Adicionar</span>
              </>
            )}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Button onClick={submit} disabled={saving || uploading}>
        {saving ? 'Salvando...' : uploading ? 'Enviando fotos...' : 'Registrar vistoria'}
      </Button>

      <Dialog open={uploadProgress !== null} onOpenChange={(open) => { if (!open) setUploadProgress(null) }}>
        <DialogContent showCloseButton={false} onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Enviando fotos...</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Progress value={uploadProgress ? (uploadProgress.current / uploadProgress.total) * 100 : 0} />
            <p className="text-sm text-muted-foreground text-center">
              {uploadProgress ? `${uploadProgress.current} de ${uploadProgress.total}` : ''}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}