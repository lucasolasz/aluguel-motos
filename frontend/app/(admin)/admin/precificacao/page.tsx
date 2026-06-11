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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  adminGetPrecificacao,
  adminSavePrecificacao,
} from '@/services/precificacao.service'
import type { PrecificacaoConfig, PrecificacaoConfigRequest, DescontoTierItem } from '@/lib/pricing'
import { getDefaultConfig } from '@/lib/pricing'
import { Loader2, Plus, Trash2, Save } from 'lucide-react'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const MES_KEYS: (keyof PrecificacaoConfig)[] = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export default function PrecificacaoPage() {
  const [config, setConfig] = useState<PrecificacaoConfig>(getDefaultConfig())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    adminGetPrecificacao()
      .then(setConfig)
      .catch(logError)
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSave() {
    setSaveError('')
    setSaveSuccess(false)
    setIsSaving(true)
    try {
      const payload: PrecificacaoConfigRequest = {
        janeiro: config.janeiro,
        fevereiro: config.fevereiro,
        marco: config.marco,
        abril: config.abril,
        maio: config.maio,
        junho: config.junho,
        julho: config.julho,
        agosto: config.agosto,
        setembro: config.setembro,
        outubro: config.outubro,
        novembro: config.novembro,
        dezembro: config.dezembro,
        carnavalInicioMes: config.carnavalInicioMes,
        carnavalInicioDia: config.carnavalInicioDia,
        carnavalFimMes: config.carnavalFimMes,
        carnavalFimDia: config.carnavalFimDia,
        carnavalFator: config.carnavalFator,
        descontoTiers: config.descontoTiers.map((t, i) => ({
          min: t.min,
          max: t.max,
          desconto: t.desconto,
          ordem: i,
        })),
      }
      const saved = await adminSavePrecificacao(payload)
      setConfig(saved)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      logError(err)
      setSaveError('Erro ao salvar configuração')
    } finally {
      setIsSaving(false)
    }
  }

  function updateMes(key: keyof PrecificacaoConfig, value: number) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  function updateTier(index: number, field: keyof DescontoTierItem, value: number) {
    setConfig((prev) => {
      const tiers = [...prev.descontoTiers]
      tiers[index] = { ...tiers[index], [field]: value }
      return { ...prev, descontoTiers: tiers }
    })
  }

  function addTier() {
    setConfig((prev) => ({
      ...prev,
      descontoTiers: [
        ...prev.descontoTiers,
        { min: 0, max: 0, desconto: 0, ordem: prev.descontoTiers.length },
      ],
    }))
  }

  function removeTier(index: number) {
    setConfig((prev) => ({
      ...prev,
      descontoTiers: prev.descontoTiers.filter((_, i) => i !== index),
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Precificação</h1>
          <p className="text-muted-foreground">
            Configure descontos por dias, sazonalidade e períodos especiais
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>

      {saveError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700">
          Configuração salva com sucesso!
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Desconto Progressivo por Dias</CardTitle>
          <CardDescription>
            Quanto mais dias o cliente alugar, maior o desconto aplicado na diária
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {config.descontoTiers.map((tier, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-24">
                  <Label className="text-xs">Min (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={tier.min}
                    onChange={(e) => updateTier(index, 'min', Number(e.target.value))}
                  />
                </div>
                <div className="w-24">
                  <Label className="text-xs">Max (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={tier.max}
                    onChange={(e) => updateTier(index, 'max', Number(e.target.value))}
                  />
                </div>
                <div className="w-32">
                  <Label className="text-xs">Desconto (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={tier.desconto}
                    onChange={(e) => updateTier(index, 'desconto', Number(e.target.value))}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTier(index)}
                  className="mt-5 text-destructive hover:text-destructive"
                  disabled={config.descontoTiers.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addTier} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar faixa
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sazonalidade Mensal</CardTitle>
          <CardDescription>
            Multiplicador aplicado ao valor da diária conforme o mês da retirada.
            1.0 = sem alteração, 0.75 = 25% mais barato, 1.25 = 25% mais caro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {MESES.map((mes, index) => {
              const key = MES_KEYS[index]
              const value = config[key] as number
              return (
                <div key={key}>
                  <Label className="text-xs">{mes}</Label>
                  <Input
                    type="number"
                    step={0.05}
                    min={0}
                    value={value}
                    onChange={(e) => updateMes(key, Number(e.target.value))}
                    className={
                      value < 1
                        ? 'border-green-500 text-green-700'
                        : value > 1
                          ? 'border-orange-500 text-orange-700'
                          : ''
                    }
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Carnaval</CardTitle>
          <CardDescription>
            Período especial com fator de preço próprio (sobrescreve o fator do mês)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <Label className="text-xs">Mês início</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={config.carnavalInicioMes}
                onChange={(e) => setConfig((prev) => ({ ...prev, carnavalInicioMes: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">Dia início</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={config.carnavalInicioDia}
                onChange={(e) => setConfig((prev) => ({ ...prev, carnavalInicioDia: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">Mês fim</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={config.carnavalFimMes}
                onChange={(e) => setConfig((prev) => ({ ...prev, carnavalFimMes: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">Dia fim</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={config.carnavalFimDia}
                onChange={(e) => setConfig((prev) => ({ ...prev, carnavalFimDia: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">Fator</Label>
              <Input
                type="number"
                step={0.05}
                min={0}
                value={config.carnavalFator}
                onChange={(e) => setConfig((prev) => ({ ...prev, carnavalFator: Number(e.target.value) }))}
                className="border-orange-500 text-orange-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
