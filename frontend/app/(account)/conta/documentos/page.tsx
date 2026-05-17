'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getMinhaCnh, salvarCnh } from '@/services/cnh.service'
import type { Cnh } from '@/lib/types'

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

function maskRg(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`
}

function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function isoToMasked(iso: string) {
  if (!iso) return ''
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy}`
}

function maskedToIso(masked: string): string {
  const [dd, mm, yyyy] = masked.split('/')
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return ''
  const iso = `${yyyy}-${mm}-${dd}`
  const date = new Date(iso)
  if (isNaN(date.getTime()) || date.getUTCFullYear() !== Number(yyyy) || date.getUTCMonth() + 1 !== Number(mm) || date.getUTCDate() !== Number(dd)) return ''
  return iso
}

function onlyDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen)
}

export default function CnhPage() {
  const [cnh, setCnh] = useState<Cnh | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [rg, setRg] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [numeroRegistro, setNumeroRegistro] = useState('')
  const [numeroCnh, setNumeroCnh] = useState('')
  const [dataValidade, setDataValidade] = useState('')
  const [estado, setEstado] = useState('')

  useEffect(() => {
    getMinhaCnh()
      .then((data) => {
        if (data) {
          setCnh(data)
          setRg(data.rg)
          setDataNascimento(isoToMasked(data.dataNascimento))
          setNumeroRegistro(data.numeroRegistro)
          setNumeroCnh(data.numeroCnh)
          setDataValidade(isoToMasked(data.dataValidade))
          setEstado(data.estado)
        }
      })
      .catch(() => setError('Erro ao carregar dados da CNH.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!estado) {
      setError('Selecione o estado.')
      return
    }
    if (numeroRegistro.length !== 11) {
      setError('Número do registro deve ter 11 dígitos.')
      return
    }
    if (numeroCnh.length !== 10) {
      setError('Número do espelho deve ter 10 dígitos.')
      return
    }
    const nascimentoIso = maskedToIso(dataNascimento)
    if (!nascimentoIso) {
      setError('Data de nascimento inválida.')
      return
    }
    const validadeIso = maskedToIso(dataValidade)
    if (!validadeIso) {
      setError('Data de validade inválida.')
      return
    }
    setSaving(true)
    try {
      const saved = await salvarCnh({
        rg,
        dataNascimento: nascimentoIso,
        numeroRegistro,
        numeroCnh,
        dataValidade: validadeIso,
        estado,
      })
      setCnh(saved)
      setSuccess(true)
    } catch {
      setError('Erro ao salvar dados da CNH.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Carteira Nacional de Habilitação</h1>
        <p className="mt-1 text-muted-foreground">
          {cnh ? 'Atualize seus dados de CNH' : 'Cadastre seus dados de CNH'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da CNH</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={rg}
                  onChange={(e) => setRg(maskRg(e.target.value))}
                  placeholder="00.000.000-0"
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(maskDate(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroRegistro">Número do Registro</Label>
                <Input
                  id="numeroRegistro"
                  value={numeroRegistro}
                  onChange={(e) => setNumeroRegistro(onlyDigits(e.target.value, 11))}
                  placeholder="00000000000"
                  inputMode="numeric"
                  maxLength={11}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroCnh">Número do Espelho</Label>
                <Input
                  id="numeroCnh"
                  value={numeroCnh}
                  onChange={(e) => setNumeroCnh(onlyDigits(e.target.value, 10))}
                  placeholder="0000000000"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataValidade">Data de Validade</Label>
                <Input
                  id="dataValidade"
                  value={dataValidade}
                  onChange={(e) => setDataValidade(maskDate(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger id="estado" className="w-full">
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

            <p className="text-sm text-muted-foreground bg-gray-300 rounded-xl p-4">
              Todos os dados coletados no cadastro do cliente serão utilizados para identificação
              das reservas e execução de contrato entre o titular e a Rio Ride Rental.
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-green-600">Dados salvos com sucesso.</p>
            )}

            <Button type="submit" disabled={saving || !estado}>
              {saving ? 'Salvando...' : cnh ? 'Atualizar' : 'Salvar Dados'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
