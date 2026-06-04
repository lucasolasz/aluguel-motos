'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MaskedInput } from '@/components/masked-input'
import { ESTADOS_BRASIL } from '@/lib/estados'
import { getCidadesByEstado, type Cidade } from '@/services/ibge.service'

export interface AddressData {
  cep: string
  logradouro: string
  numero: string
  semNumero: boolean
  complemento: string
  estado: string
  cidade: string
  bairro: string
}

export const EMPTY_ADDRESS: AddressData = {
  cep: '',
  logradouro: '',
  numero: '',
  semNumero: false,
  complemento: '',
  estado: '',
  cidade: '',
  bairro: '',
}

interface AddressFieldsProps {
  value: AddressData
  onChange: (patch: Partial<AddressData>) => void
  idPrefix?: string
}

export function AddressFields({ value, onChange, idPrefix = '' }: AddressFieldsProps) {
  const [cepLoading, setCepLoading] = useState(false)
  const [cidadesLoading, setCidadesLoading] = useState(false)
  const [cidades, setCidades] = useState<Cidade[]>([])

  async function handleCepBlur(cep: string) {
    const cleaned = cep.replace(/\D/g, '')
    if (cleaned.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
      const data = await res.json()
      if (!data.erro) {
        const estado = (data.uf ?? '').toUpperCase()
        const cidadeNome = (data.localidade ?? '').toUpperCase()
        const bairroNome = (data.bairro ?? '').toUpperCase()

        onChange({
          logradouro: (data.logradouro ?? value.logradouro).toUpperCase(),
          bairro: bairroNome,
          cidade: cidadeNome,
          estado,
        })

        setCidadesLoading(true)
        try {
          const cidadesData = await getCidadesByEstado(estado)
          const cidadeExiste = cidadesData.some((c) => c.nome.toUpperCase() === cidadeNome)
          const cidadesComCidade = cidadeExiste
            ? cidadesData
            : [...cidadesData, { id: 0, nome: data.localidade ?? '' }]
          setCidades(cidadesComCidade)
        } catch {
          setCidades([])
        }
        setCidadesLoading(false)
      }
    } finally {
      setCepLoading(false)
    }
  }

  async function handleEstadoChange(estado: string) {
    onChange({ estado: estado.toUpperCase(), cidade: '', bairro: '' })
    setCidades([])
    if (!estado) return
    setCidadesLoading(true)
    try {
      const result = await getCidadesByEstado(estado)
      setCidades(result)
    } catch {
      setCidades([])
    }
    setCidadesLoading(false)
  }

  const p = (id: string) => idPrefix ? `${idPrefix}-${id}` : id

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={p('cep')}>CEP</Label>
        <div className="relative">
          <MaskedInput
            id={p('cep')}
            mask="00000-000"
            value={value.cep}
            onAccept={(val) => onChange({ cep: val })}
            onBlur={(e) => handleCepBlur(e.target.value)}
            placeholder="00000-000"
          />
          {cepLoading && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={p('logradouro')}>Endereço</Label>
        <Input
          id={p('logradouro')}
          value={value.logradouro}
          onChange={(e) => onChange({ logradouro: e.target.value.toUpperCase() })}
          placeholder="RUA, AVENIDA..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={p('numero')}>Número</Label>
        <Input
          id={p('numero')}
          value={value.numero}
          onChange={(e) => onChange({ numero: e.target.value.replace(/\D/g, '') })}
          placeholder="123"
          disabled={value.semNumero}
        />
      </div>
      <div className="flex items-end space-y-2 pb-1">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            checked={value.semNumero}
            onChange={(e) =>
              onChange({
                semNumero: e.target.checked,
                numero: e.target.checked ? '' : value.numero,
              })
            }
          />
          Sem número
        </label>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={p('complemento')}>Complemento</Label>
        <Input
          id={p('complemento')}
          value={value.complemento}
          onChange={(e) => onChange({ complemento: e.target.value.toUpperCase() })}
          placeholder="APTO, BLOCO... (OPCIONAL)"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={p('estado')}>Estado</Label>
        <Select value={value.estado} onValueChange={handleEstadoChange}>
          <SelectTrigger className="w-full">
            {cidadesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue placeholder="SEL" />
            )}
          </SelectTrigger>
          <SelectContent position="popper">
            {ESTADOS_BRASIL.map((estado) => (
              <SelectItem key={estado.sigla} value={estado.sigla}>
                {estado.sigla} - {estado.nome.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={p('cidade')}>Cidade</Label>
        <Select
          value={value.cidade}
          onValueChange={(v) => onChange({ cidade: v })}
          disabled={!value.estado || cidadesLoading}
        >
          <SelectTrigger className="w-full">
            {cidadesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectValue placeholder="CIDADE" />
            )}
          </SelectTrigger>
          <SelectContent position="popper">
            {cidades.map((cidade) => (
              <SelectItem key={cidade.id} value={cidade.nome.toUpperCase()}>
                {cidade.nome.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={p('bairro')}>Bairro</Label>
        <Input
          id={p('bairro')}
          value={value.bairro}
          onChange={(e) => onChange({ bairro: e.target.value.toUpperCase() })}
          placeholder="CENTRO"
        />
      </div>
    </div>
  )
}