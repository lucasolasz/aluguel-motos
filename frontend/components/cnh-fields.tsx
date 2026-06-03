'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export function maskRg(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`
}

export function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function isoToMasked(iso: string) {
  if (!iso) return ''
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy}`
}

export function maskedToIso(masked: string): string {
  const [dd, mm, yyyy] = masked.split('/')
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return ''
  const iso = `${yyyy}-${mm}-${dd}`
  const date = new Date(iso)
  if (isNaN(date.getTime()) || date.getUTCFullYear() !== Number(yyyy) || date.getUTCMonth() + 1 !== Number(mm) || date.getUTCDate() !== Number(dd)) return ''
  return iso
}

export function onlyDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen)
}

export interface CnhValues {
  rg: string
  dataNascimento: string
  numeroRegistro: string
  numeroCnh: string
  dataValidade: string
  estado: string
}

/**
 * Valida os campos da CNH (já mascarados). Retorna as datas em ISO quando válidas.
 */
export function validarCnh(values: CnhValues): {
  ok: boolean
  error: string
  dataNascimentoIso: string
  dataValidadeIso: string
} {
  if (!values.estado) {
    return { ok: false, error: 'Selecione o estado.', dataNascimentoIso: '', dataValidadeIso: '' }
  }
  if (values.numeroRegistro.length !== 11) {
    return { ok: false, error: 'Número do registro deve ter 11 dígitos.', dataNascimentoIso: '', dataValidadeIso: '' }
  }
  if (values.numeroCnh.length !== 10) {
    return { ok: false, error: 'Número do espelho deve ter 10 dígitos.', dataNascimentoIso: '', dataValidadeIso: '' }
  }
  const dataNascimentoIso = maskedToIso(values.dataNascimento)
  if (!dataNascimentoIso) {
    return { ok: false, error: 'Data de nascimento inválida.', dataNascimentoIso: '', dataValidadeIso: '' }
  }
  const dataValidadeIso = maskedToIso(values.dataValidade)
  if (!dataValidadeIso) {
    return { ok: false, error: 'Data de validade inválida.', dataNascimentoIso: '', dataValidadeIso: '' }
  }
  return { ok: true, error: '', dataNascimentoIso, dataValidadeIso }
}

interface CnhFieldsProps {
  values: CnhValues
  onChange: (patch: Partial<CnhValues>) => void
  idPrefix?: string
}

/**
 * Grid com os 6 campos da CNH (RG, nascimento, registro, espelho, validade, estado).
 * Controlado: recebe valores mascarados e emite patches via onChange.
 */
export function CnhFields({ values, onChange, idPrefix = '' }: CnhFieldsProps) {
  const id = (name: string) => `${idPrefix}${name}`
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={id('rg')}>RG</Label>
        <Input
          id={id('rg')}
          value={values.rg}
          onChange={(e) => onChange({ rg: maskRg(e.target.value) })}
          placeholder="00.000.000-0"
          inputMode="numeric"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={id('dataNascimento')}>Data de Nascimento</Label>
        <Input
          id={id('dataNascimento')}
          value={values.dataNascimento}
          onChange={(e) => onChange({ dataNascimento: maskDate(e.target.value) })}
          placeholder="DD/MM/AAAA"
          inputMode="numeric"
          maxLength={10}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={id('numeroRegistro')}>Número do Registro</Label>
        <Input
          id={id('numeroRegistro')}
          value={values.numeroRegistro}
          onChange={(e) => onChange({ numeroRegistro: onlyDigits(e.target.value, 11) })}
          placeholder="00000000000"
          inputMode="numeric"
          maxLength={11}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={id('numeroCnh')}>Número do Espelho</Label>
        <Input
          id={id('numeroCnh')}
          value={values.numeroCnh}
          onChange={(e) => onChange({ numeroCnh: onlyDigits(e.target.value, 10) })}
          placeholder="0000000000"
          inputMode="numeric"
          maxLength={10}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={id('dataValidade')}>Data de Validade</Label>
        <Input
          id={id('dataValidade')}
          value={values.dataValidade}
          onChange={(e) => onChange({ dataValidade: maskDate(e.target.value) })}
          placeholder="DD/MM/AAAA"
          inputMode="numeric"
          maxLength={10}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={id('estado')}>Estado</Label>
        <Select value={values.estado} onValueChange={(v) => onChange({ estado: v })}>
          <SelectTrigger id={id('estado')} className="w-full">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent position="popper">
            {ESTADOS.map((uf) => (
              <SelectItem key={uf} value={uf}>
                {uf}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
