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
import type { Acessorio, Moto, Seguro } from '@/lib/types'
import { criarReserva } from '@/services/reservas.service'
import { BookingStepper } from './booking-stepper'
import { CompletionScreen } from './completion-screen'
import { PriceSummary } from './price-summary'
import { DatasStep } from './etapa1/datas-step'
import { SeguroStep } from './etapa2/seguro-step'
import { AcessoriosStep } from './etapa3/acessorios-step'
import { ResumoStep } from './etapa4/resumo-step'
import { DadosStep } from './etapa5/dados-step'
import { useStep5 } from './etapa5/use-step5'

const steps = [
  { id: 1, name: 'Datas' },
  { id: 2, name: 'Seguro' },
  { id: 3, name: 'Acessórios' },
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
}

export function BookingPageClient({ moto, seguros, acessorios }: BookingPageClientProps) {
  const router = useRouter()
  const defaultSeguroId = seguros.find((s) => s.basico)?.id ?? seguros[0]?.id ?? ''

  const [currentStep, setCurrentStep] = useState(1)
  const [pickupDate, setPickupDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [selectedSeguroId, setSelectedSeguroId] = useState(defaultSeguroId)
  const [selectedAcessorios, setSelectedAcessorios] = useState<
    { acessorioId: string; quantity: number }[]
  >([])

  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [reservaId, setReservaId] = useState<string>('')
  const [finalizationError, setFinalizationError] = useState('')

  const step5 = useStep5({ active: currentStep === 5 })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stepParam = params.get('step')
    if (!stepParam) return
    const step = parseInt(stepParam, 10)
    if (isNaN(step) || step < 1 || step > steps.length) return
    const saved = sessionStorage.getItem(`booking-state-${moto.id}`)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        if (state.pickupDate) setPickupDate(new Date(state.pickupDate))
        if (state.returnDate) setReturnDate(new Date(state.returnDate))
        if (state.selectedSeguroId) setSelectedSeguroId(state.selectedSeguroId)
        if (state.selectedAcessorios) setSelectedAcessorios(state.selectedAcessorios)
      } catch {}
    }
    setCurrentStep(step)
  }, [])

  useEffect(() => {
    if (!pickupDate || !returnDate) return
    sessionStorage.setItem(
      `booking-state-${moto.id}`,
      JSON.stringify({
        pickupDate: pickupDate.toISOString(),
        returnDate: returnDate.toISOString(),
        selectedSeguroId,
        selectedAcessorios,
      })
    )
  }, [pickupDate, returnDate, selectedSeguroId, selectedAcessorios, moto.id])

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
      case 1: return pickupDate && returnDate && days > 0
      case 2: return !!selectedSeguroId
      case 3: return true
      case 4: return true
      case 5: return step5.isReady
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep === 4 && !getToken()) {
      router.push(`/login?redirect=/reservar/${moto.id}?step=5`)
      return
    }
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      window.history.replaceState(null, '', `/reservar/${moto.id}?step=${nextStep}`)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      window.history.replaceState(null, '', `/reservar/${moto.id}?step=${prevStep}`)
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
        cartaoId: step5.selectedCardId ?? undefined,
        acessorios: selectedAcessorios.map((a) => ({
          acessorioId: a.acessorioId,
          quantidade: a.quantity,
        })),
      })
      setReservaId(result.id)
      sessionStorage.removeItem(`booking-state-${moto.id}`)
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
            <Link href={`/motos/${moto.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar para detalhes
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
                      pickupDate={pickupDate}
                      returnDate={returnDate}
                      onPickupChange={setPickupDate}
                      onReturnChange={setReturnDate}
                      days={days}
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
