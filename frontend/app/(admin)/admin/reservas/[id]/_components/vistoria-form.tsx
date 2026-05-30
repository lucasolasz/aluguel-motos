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
import { ImagePlus, Loader2, X } from 'lucide-react'
import { uploadVistoriaFoto } from '@/services/upload.service'
import { adminRegistrarVistoria } from '@/services/reservas.service'
import {
  NIVEL_COMBUSTIVEL_LABELS,
  type NivelCombustivel,
  type ReservaDetalhe,
  type TipoVistoria,
} from '@/lib/atendimento-types'

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
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setErro(null)
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const res = await uploadVistoriaFoto(file, reservaId)
        setFotos((prev) => [...prev, res.url])
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha no upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const submit = async () => {
    setErro(null)
    setSaving(true)
    try {
      const d = await adminRegistrarVistoria(reservaId, {
        tipo,
        kmRegistrado: km ? Number(km) : null,
        nivelCombustivel: nivel || null,
        observacoes: observacoes || null,
        fotos,
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
          {fotos.map((url) => (
            <div key={url} className="relative h-24 w-24 overflow-hidden rounded-md border">
              <Image src={url} alt="Foto vistoria" fill className="object-cover" sizes="96px" />
              <button
                type="button"
                onClick={() => setFotos((prev) => prev.filter((u) => u !== url))}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:bg-muted"
          >
            {uploading ? (
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
        {saving ? 'Salvando...' : 'Registrar vistoria'}
      </Button>
    </div>
  )
}
