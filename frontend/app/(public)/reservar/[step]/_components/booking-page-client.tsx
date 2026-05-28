'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getToken } from '@/lib/auth'
import type { Acessorio, Local, Moto, Seguro } from '@/lib/types'
import { criarReserva } from '@/services/reservas.service'
import { BookingStepper } from './booking-stepper'
import { CompletionScreen } from './completion-screen'
import { PriceSummary } from './price-summary'
import { DatasStep } from './etapa1/datas-step'
import { SeguroStep } from './etapa2/seguro-step'
import { AcessoriosStep } from './etapa3/acessorios-step'
import type { QuilometragemPlano } from './etapa3/_components/kilometragem-selector'
import { ResumoStep } from './etapa4/resumo-step'
import { DadosStep } from './etapa5/dados-step'
import { useStep5 } from './etapa5/use-step5'

const steps = [
  { id: 1, name: 'Datas' },
  { id: 2, name: 'Seguro' },
  { id: 3, name: 'Tarifas e adicionais' },
  { id: 4, name: 'Resumo' },
  { id: 5, name: 'Dados' },
]

function calculateRentalDays(pickup: Date, returnDate: Date): number {
  const diff = returnDate.getTime() - pickup.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

interface BookingPageClientProps {
  moto: Moto
  seguros: Seguro[]
  acessorios: Acessorio[]
  locais: Local[]
  initialStep?: number
}

export function BookingPageClient({ moto, seguros, acessorios, locais, initialStep }: BookingPageClientProps) {
  const router = useRouter()
  const defaultSeguroId =
    seguros.find((s) => s.nome.toLowerCase().includes('completo'))?.id ??
    seguros.find((s) => s.basico)?.id ??
    seguros[0]?.id ??
    ''

  const [currentStep, setCurrentStep] = useState(initialStep ?? 1)
  const [pickupDate, setPickupDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [horaRetirada, setHoraRetirada] = useState<string>('')
  const [horaDevolucao, setHoraDevolucao] = useState<string>('')
  const [localRetiradaId, setLocalRetiradaId] = useState<string>('')
  const [localDevolucaoId, setLocalDevolucaoId] = useState<string>('')
  const [selectedSeguroId, setSelectedSeguroId] = useState(defaultSeguroId)
  const [selectedAcessorios, setSelectedAcessorios] = useState<
    { acessorioId: string; quantity: number }[]
  >([])
  const [selectedQuilometragem, setSelectedQuilometragem] = useState<QuilometragemPlano>('economica')

  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [reservaId, setReservaId] = useState<string>('')
  const [finalizationError, setFinalizationError] = useState('')
  const isStep1Prefilled =
    !!localRetiradaId &&
    !!pickupDate &&
    !!horaRetirada &&
    !!localDevolucaoId &&
    !!returnDate &&
    !!horaDevolucao

  const handleEditDates = () => {
    const params = new URLSearchParams({ search: 'open' })
    if (pickupDate) params.set('pickup', pickupDate.toISOString())
    if (returnDate) params.set('return', returnDate.toISOString())
    if (horaRetirada) params.set('hora_retirada', horaRetirada)
    if (horaDevolucao) params.set('hora_devolucao', horaDevolucao)
    if (localRetiradaId) params.set('local_retirada', localRetiradaId)
    if (localDevolucaoId) params.set('local_devolucao', localDevolucaoId)
    router.push(`/?${params.toString()}`)
  }

  const step5 = useStep5({ active: currentStep === 5 })

  useEffect(() => {
    let restoredPickup: Date | undefined
    let restoredReturn: Date | undefined
    let restoredHoraRetirada = ''
    let restoredHoraDevolucao = ''
    let restoredLocalRetiradaId = ''
    let restoredLocalDevolucaoId = ''
    let restoredSeguroId = defaultSeguroId
    let restoredAcessorios: { acessorioId: string; quantity: number }[] = []
    let completedSteps: number[] = []

    const rawPeriod = sessionStorage.getItem('search-period')
    if (rawPeriod) {
      try {
        const p = JSON.parse(rawPeriod)
        if (p.pickup) { const d = new Date(p.pickup); if (!isNaN(d.getTime())) restoredPickup = d }
        if (p.return) { const d = new Date(p.return); if (!isNaN(d.getTime())) restoredReturn = d }
        if (p.hora_retirada) restoredHoraRetirada = p.hora_retirada
        if (p.hora_devolucao) restoredHoraDevolucao = p.hora_devolucao
        if (p.local_retirada) restoredLocalRetiradaId = p.local_retirada
        if (p.local_devolucao) restoredLocalDevolucaoId = p.local_devolucao
      } catch {}
    }

    const saved = sessionStorage.getItem(`booking-state-${moto.id}`)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        if (!restoredPickup && state.pickupDate) restoredPickup = new Date(state.pickupDate)
        if (!restoredReturn && state.returnDate) restoredReturn = new Date(state.returnDate)
        if (!restoredHoraRetirada && state.horaRetirada) restoredHoraRetirada = state.horaRetirada
        if (!restoredHoraDevolucao && state.horaDevolucao) restoredHoraDevolucao = state.horaDevolucao
        if (!restoredLocalRetiradaId && state.localRetiradaId) restoredLocalRetiradaId = state.localRetiradaId
        if (!restoredLocalDevolucaoId && state.localDevolucaoId) restoredLocalDevolucaoId = state.localDevolucaoId
        if (state.selectedSeguroId) restoredSeguroId = state.selectedSeguroId
        if (state.selectedAcessorios) restoredAcessorios = state.selectedAcessorios
        if (state.selectedQuilometragem === 'economica' || state.selectedQuilometragem === 'ilimitada') setSelectedQuilometragem(state.selectedQuilometragem)
        if (Array.isArray(state.completedSteps)) completedSteps = state.completedSteps
      } catch {}
    }

    if (restoredPickup) setPickupDate(restoredPickup)
    if (restoredReturn) setReturnDate(restoredReturn)
    if (restoredHoraRetirada) setHoraRetirada(restoredHoraRetirada)
    if (restoredHoraDevolucao) setHoraDevolucao(restoredHoraDevolucao)
    if (restoredLocalRetiradaId) setLocalRetiradaId(restoredLocalRetiradaId)
    if (restoredLocalDevolucaoId) setLocalDevolucaoId(restoredLocalDevolucaoId)
    setSelectedSeguroId(restoredSeguroId)
    setSelectedAcessorios(restoredAcessorios)
  }, [])

  useEffect(() => {
    if (!pickupDate || !returnDate) return
    sessionStorage.setItem(
      `booking-state-${moto.id}`,
      JSON.stringify({
        pickupDate: pickupDate.toISOString(),
        returnDate: returnDate.toISOString(),
        horaRetirada,
        horaDevolucao,
        localRetiradaId,
        localDevolucaoId,
        selectedSeguroId,
        selectedAcessorios,
        selectedQuilometragem,
      })
    )
  }, [
    pickupDate,
    returnDate,
    horaRetirada,
    horaDevolucao,
    localRetiradaId,
    localDevolucaoId,
    selectedSeguroId,
    selectedAcessorios,
    selectedQuilometragem,
    moto.id,
  ])

  const days = pickupDate && returnDate ? calculateRentalDays(pickupDate, returnDate) : 0
  const selectedSeguro = seguros.find((s) => s.id === selectedSeguroId) ?? null
  const acessoriosWithDetails = selectedAcessorios
    .map((item) => ({
      acessorio: acessorios.find((a) => a.id === item.acessorioId)!,
      quantity: item.quantity,
    }))
    .filter((item) => item.acessorio && item.quantity > 0)

  const handleAcessorioUpdate = (acessorioId: string, quantity: number) => {
    setSelectedAcessorios((prev) => {
      const existing = prev.find((item) => item.acessorioId === acessorioId)
      if (existing) {
        if (quantity === 0) return prev.filter((item) => item.acessorioId !== acessorioId)
        return prev.map((item) =>
          item.acessorioId === acessorioId ? { ...item, quantity } : item
        )
      }
      if (quantity > 0) return [...prev, { acessorioId, quantity }]
      return prev
    })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          !!pickupDate &&
          !!returnDate &&
          days > 0 &&
          !!horaRetirada &&
          !!horaDevolucao &&
          !!localRetiradaId &&
          !!localDevolucaoId
        )
      case 2: return !!selectedSeguroId
      case 3: return true
      case 4: return true
      case 5: return step5.isReady
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep === 4 && !getToken()) {
      const storageKey = `booking-state-${moto.id}`
      try {
        const saved = sessionStorage.getItem(storageKey)
        const state = saved ? JSON.parse(saved) : {}
        const completedSteps: number[] = state.completedSteps ?? []
        if (!completedSteps.includes(4)) completedSteps.push(4)
        sessionStorage.setItem(storageKey, JSON.stringify({ ...state, completedSteps }))
      } catch {}
      router.push(`/login?redirect=${encodeURIComponent('/reservar/passo-5')}`)
      return
    }
    if (currentStep < steps.length) {
      const storageKey = `booking-state-${moto.id}`
      try {
        const saved = sessionStorage.getItem(storageKey)
        const state = saved ? JSON.parse(saved) : {}
        const completedSteps: number[] = state.completedSteps ?? []
        if (!completedSteps.includes(currentStep)) completedSteps.push(currentStep)
        sessionStorage.setItem(storageKey, JSON.stringify({ ...state, completedSteps }))
      } catch {}

      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      window.history.replaceState(null, '', `/reservar/passo-${nextStep}`)
    }
  }

  const handleBack = () => {
    if (currentStep === 5 && step5.step5Phase === 'card-form' && step5.userCards.length > 0) {
      step5.backFromCardForm()
      return
    }
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      window.history.replaceState(null, '', `/reservar/passo-${prevStep}`)
    }
  }

  const handleFinalizar = async () => {
    setIsProcessing(true)
    setFinalizationError('')
    try {
      const result = await criarReserva({
        motoId: moto.id,
        seguroId: selectedSeguroId,
        dataRetirada: pickupDate!.toISOString().split('T')[0],
        dataDevolucao: returnDate!.toISOString().split('T')[0],
        horaRetirada,
        horaDevolucao,
        localRetiradaId,
        localDevolucaoId,
        cartaoId: step5.selectedCardId ?? undefined,
        acessorios: selectedAcessorios.map((a) => ({
          acessorioId: a.acessorioId,
          quantidade: a.quantity,
        })),
      })
      setReservaId(result.id)
      sessionStorage.removeItem(`booking-state-${moto.id}`)
      sessionStorage.removeItem('booking-moto-id')
      sessionStorage.removeItem('search-period')
      setIsComplete(true)
    } catch {
      setFinalizationError('Erro ao finalizar reserva. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isComplete) {
    return (
      <CompletionScreen
        reservaId={reservaId}
        motoNome={moto.nome}
        days={days}
        pickupDate={pickupDate}
        returnDate={returnDate}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="mb-6 gap-2">
            <Link href="/motos">
              <ArrowLeft className="h-4 w-4" />
              Voltar para motos
            </Link>
          </Button>

          <div className="mb-8">
            <BookingStepper steps={steps} currentStep={currentStep} />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">

                  {currentStep === 1 && (
                    <DatasStep
                      locais={locais}
                      pickupDate={pickupDate}
                      returnDate={returnDate}
                      onPickupChange={setPickupDate}
                      onReturnChange={setReturnDate}
                      horaRetirada={horaRetirada}
                      horaDevolucao={horaDevolucao}
                      onHoraRetiradaChange={setHoraRetirada}
                      onHoraDevolucaoChange={setHoraDevolucao}
                      localRetiradaId={localRetiradaId}
                      localDevolucaoId={localDevolucaoId}
                      onLocalRetiradaChange={setLocalRetiradaId}
                      onLocalDevolucaoChange={setLocalDevolucaoId}
                      days={days}
                      readOnly={isStep1Prefilled}
                      onEdit={handleEditDates}
                    />
                  )}

                  {currentStep === 2 && (
                    <SeguroStep
                      seguros={seguros}
                      selectedId={selectedSeguroId}
                      onSelect={setSelectedSeguroId}
                    />
                  )}

                  {currentStep === 3 && (
                    <AcessoriosStep
                      acessorios={acessorios}
                      selected={selectedAcessorios}
                      onUpdate={handleAcessorioUpdate}
                      precoPorDia={moto.precoPorDia}
                      days={days}
                      selectedQuilometragem={selectedQuilometragem}
                      onQuilometragemChange={setSelectedQuilometragem}
                    />
                  )}

                  {currentStep === 4 && (
                    <ResumoStep
                      moto={moto}
                      pickupDate={pickupDate}
                      returnDate={returnDate}
                      days={days}
                      selectedSeguro={selectedSeguro}
                      acessoriosWithDetails={acessoriosWithDetails}
                    />
                  )}

                  {currentStep === 5 && <DadosStep controller={step5} />}

                  <div className="mt-8 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>

                    {currentStep < steps.length && (
                      <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                        Continuar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}

                    {currentStep === steps.length && step5.step5Phase === 'selection' && (
                      <div className="flex flex-col items-end gap-1">
                        {finalizationError && (
                          <p className="text-sm text-destructive">{finalizationError}</p>
                        )}
                        <Button
                          onClick={handleFinalizar}
                          disabled={!canProceed() || isProcessing}
                          className="gap-2"
                        >
                          {isProcessing ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Processando...</>
                          ) : (
                            <><Check className="h-4 w-4" />Finalizar Reserva</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <PriceSummary
                  moto={moto}
                  days={days}
                  seguro={selectedSeguro}
                  acessorios={acessoriosWithDetails}
                  quilometragem={selectedQuilometragem}
                  pickupDate={pickupDate}
                  returnDate={returnDate}
                  horaRetirada={horaRetirada || undefined}
                  horaDevolucao={horaDevolucao || undefined}
                  localRetirada={locais.find((l) => l.id === localRetiradaId) ?? null}
                  localDevolucao={locais.find((l) => l.id === localDevolucaoId) ?? null}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
