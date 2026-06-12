'use client'

import {
  CnhFields,
  isoToMasked,
  validarCnh,
  type CnhValues,
} from '@/components/cnh-fields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Cnh } from '@/lib/types'
import { getMinhaCnh, salvarCnh } from '@/services/cnh.service'
import { useEffect, useState } from 'react'
import { IoMdInformationCircle } from 'react-icons/io'

const EMPTY_CNH: CnhValues = {
  rg: '',
  dataNascimento: '',
  numeroRegistro: '',
  numeroCnh: '',
  dataValidade: '',
  estado: '',
}

export default function CnhPage() {
  const [cnh, setCnh] = useState<Cnh | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [values, setValues] = useState<CnhValues>(EMPTY_CNH)

  function patch(p: Partial<CnhValues>) {
    setValues((prev) => ({ ...prev, ...p }))
  }

  useEffect(() => {
    getMinhaCnh()
      .then((data) => {
        if (data) {
          setCnh(data)
          setValues({
            rg: data.rg,
            dataNascimento: isoToMasked(data.dataNascimento),
            numeroRegistro: data.numeroRegistro,
            numeroCnh: data.numeroCnh,
            dataValidade: isoToMasked(data.dataValidade),
            estado: data.estado,
          })
        }
      })
      .catch(() => setError('Erro ao carregar dados da CNH.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const result = validarCnh(values)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSaving(true)
    try {
      const saved = await salvarCnh({
        rg: values.rg,
        dataNascimento: result.dataNascimentoIso,
        numeroRegistro: values.numeroRegistro,
        numeroCnh: values.numeroCnh,
        dataValidade: result.dataValidadeIso,
        estado: values.estado,
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
            <CnhFields values={values} onChange={patch} />

            <p className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-xl p-4">
              <IoMdInformationCircle size={30} />
              Todos os dados coletados no cadastro do cliente serão utilizados para identificação
              das reservas e execução de contrato entre o titular e a Rio Ride Rental.
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-primary">Dados salvos com sucesso.</p>
            )}

            <Button type="submit" disabled={saving || !values.estado}>
              {saving ? 'Salvando...' : cnh ? 'Atualizar' : 'Salvar Dados'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
