'use client'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Acessorio, Moto, Seguro } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/data'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, ArrowRight, CalendarIcon, Check, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AccessorySelector } from './accessory-selector'
import { BookingStepper } from './booking-stepper'
import { DocumentUploader } from './document-uploader'
import { InsuranceSelector } from './insurance-selector'
import { PriceSummary } from './price-summary'

const steps = [
  { id: 1, name: 'Datas' },
  { id: 2, name: 'Seguro' },
  { id: 3, name: 'Acessórios' },
  { id: 4, name: 'Resumo' },
  { id: 5, name: 'Dados' },
  { id: 6, name: 'Documentos' },
  { id: 7, name: 'Pagamento' },
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
  const defaultSeguroId = seguros.find((s) => s.basico)?.id ?? seguros[0]?.id ?? ''

  const [currentStep, setCurrentStep] = useState(1)
  const [pickupDate, setPickupDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [selectedSeguroId, setSelectedSeguroId] = useState(defaultSeguroId)
  const [selectedAcessorios, setSelectedAcessorios] = useState<
    { acessorioId: string; quantity: number }[]
  >([])
  const [customerData, setCustomerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    cnh: '',
  })
  const [documents, setDocuments] = useState<{
    cnhFront: File | null
    cnhBack: File | null
    selfie: File | null
  }>({
    cnhFront: null,
    cnhBack: null,
    selfie: null,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

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
        if (quantity === 0) {
          return prev.filter((item) => item.acessorioId !== acessorioId)
        }
        return prev.map((item) =>
          item.acessorioId === acessorioId ? { ...item, quantity } : item
        )
      }
      if (quantity > 0) {
        return [...prev, { acessorioId, quantity }]
      }
      return prev
    })
  }

  const handleDocumentUpdate = (
    field: 'cnhFront' | 'cnhBack' | 'selfie',
    file: File | null
  ) => {
    setDocuments((prev) => ({ ...prev, [field]: file }))
  }

  const handleCustomerDataChange = (field: string, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return pickupDate && returnDate && days > 0
      case 2:
        return !!selectedSeguroId
      case 3:
        return true
      case 4:
        return true
      case 5:
        return (
          customerData.fullName &&
          customerData.email &&
          customerData.phone &&
          customerData.cpf &&
          customerData.cnh
        )
      case 6:
        return documents.cnhFront && documents.cnhBack && documents.selfie
      case 7:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setIsComplete(true)
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center py-12">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Check className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">
              Reserva Confirmada!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sua reserva foi realizada com sucesso. Você receberá um e-mail com
              todos os detalhes.
            </p>
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Número da reserva</p>
              <p className="text-xl font-bold text-foreground">
                RES-{Date.now().toString().slice(-8)}
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  {moto.nome} - {days} {days === 1 ? 'dia' : 'dias'}
                </p>
                <p>
                  {pickupDate && format(pickupDate, "dd 'de' MMMM", { locale: ptBR })} -{' '}
                  {returnDate && format(returnDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/conta/reservas">Ver Minhas Reservas</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Voltar ao Início</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
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
                  {/* Step 1: Datas */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          Selecione as Datas
                        </h2>
                        <p className="mt-1 text-muted-foreground">
                          Escolha quando deseja retirar e devolver a moto
                        </p>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Data de Retirada</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !pickupDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {pickupDate
                                  ? format(pickupDate, "dd 'de' MMMM 'de' yyyy", {
                                      locale: ptBR,
                                    })
                                  : 'Selecione a data'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={pickupDate}
                                onSelect={setPickupDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>Data de Devolução</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !returnDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {returnDate
                                  ? format(returnDate, "dd 'de' MMMM 'de' yyyy", {
                                      locale: ptBR,
                                    })
                                  : 'Selecione a data'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={returnDate}
                                onSelect={setReturnDate}
                                disabled={(date) =>
                                  date < (pickupDate || new Date())
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {days > 0 && (
                        <div className="rounded-lg bg-muted p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Duração do aluguel
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {days} {days === 1 ? 'dia' : 'dias'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Seguro */}
                  {currentStep === 2 && (
                    <InsuranceSelector
                      seguros={seguros}
                      selectedId={selectedSeguroId}
                      onSelect={setSelectedSeguroId}
                    />
                  )}

                  {/* Step 3: Acessórios */}
                  {currentStep === 3 && (
                    <AccessorySelector
                      acessorios={acessorios}
                      selected={selectedAcessorios}
                      onUpdate={handleAcessorioUpdate}
                    />
                  )}

                  {/* Step 4: Resumo */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          Confirme sua Reserva
                        </h2>
                        <p className="mt-1 text-muted-foreground">
                          Revise os detalhes antes de continuar
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-lg border border-border p-4">
                          <p className="text-sm text-muted-foreground">Moto</p>
                          <p className="font-medium text-foreground">{moto.nome}</p>
                        </div>
                        <div className="rounded-lg border border-border p-4">
                          <p className="text-sm text-muted-foreground">Período</p>
                          <p className="font-medium text-foreground">
                            {pickupDate &&
                              format(pickupDate, "dd 'de' MMMM", { locale: ptBR })}{' '}
                            -{' '}
                            {returnDate &&
                              format(returnDate, "dd 'de' MMMM", { locale: ptBR })}
                            {' '}({days} {days === 1 ? 'dia' : 'dias'})
                          </p>
                        </div>
                        <div className="rounded-lg border border-border p-4">
                          <p className="text-sm text-muted-foreground">Seguro</p>
                          <p className="font-medium text-foreground">
                            {selectedSeguro?.nome}
                          </p>
                        </div>
                        {acessoriosWithDetails.length > 0 && (
                          <div className="rounded-lg border border-border p-4">
                            <p className="text-sm text-muted-foreground">Acessórios</p>
                            <p className="font-medium text-foreground">
                              {acessoriosWithDetails
                                .map((item) => `${item.acessorio.nome} x${item.quantity}`)
                                .join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Dados do Cliente */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          Seus Dados
                        </h2>
                        <p className="mt-1 text-muted-foreground">
                          Preencha suas informações pessoais
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="fullName">Nome Completo</Label>
                          <Input
                            id="fullName"
                            value={customerData.fullName}
                            onChange={(e) =>
                              handleCustomerDataChange('fullName', e.target.value)
                            }
                            placeholder="Digite seu nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            value={customerData.email}
                            onChange={(e) =>
                              handleCustomerDataChange('email', e.target.value)
                            }
                            placeholder="seu@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={customerData.phone}
                            onChange={(e) =>
                              handleCustomerDataChange('phone', e.target.value)
                            }
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            value={customerData.cpf}
                            onChange={(e) =>
                              handleCustomerDataChange('cpf', e.target.value)
                            }
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cnh">Número da CNH</Label>
                          <Input
                            id="cnh"
                            value={customerData.cnh}
                            onChange={(e) =>
                              handleCustomerDataChange('cnh', e.target.value)
                            }
                            placeholder="00000000000"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Documentos */}
                  {currentStep === 6 && (
                    <DocumentUploader
                      documents={documents}
                      onUpdate={handleDocumentUpdate}
                    />
                  )}

                  {/* Step 7: Pagamento */}
                  {currentStep === 7 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          Pagamento
                        </h2>
                        <p className="mt-1 text-muted-foreground">
                          Finalize sua reserva com pagamento seguro
                        </p>
                      </div>

                      <Card className="border-2 border-dashed border-muted-foreground/30">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                          <CreditCard className="h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-lg font-medium text-foreground">
                            Integração Stripe
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            O formulário de pagamento Stripe será exibido aqui.
                            Pagamento seguro com cartão de crédito.
                          </p>
                          <div className="mt-6 rounded-lg bg-muted p-4">
                            <p className="text-sm text-muted-foreground">Valor total</p>
                            <p className="text-2xl font-bold text-foreground">
                              {selectedSeguro &&
                                formatCurrency(
                                  moto.precoPorDia * days +
                                    selectedSeguro.precoPorDia * days +
                                    acessoriosWithDetails.reduce(
                                      (total, item) =>
                                        total +
                                        item.acessorio.precoPorDia *
                                          item.quantity *
                                          days,
                                      0
                                    )
                                )}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              + Caução: {formatCurrency(moto.caucao)} (pré-autorização)
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Navigation */}
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

                    {currentStep < steps.length ? (
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="gap-2"
                      >
                        Continuar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        {isProcessing ? 'Processando...' : 'Finalizar Pagamento'}
                        {!isProcessing && <CreditCard className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
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
