'use client'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Acessorio, Cartao, EnderecoCobranca, Moto, Seguro } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/data'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, ArrowRight, CalendarIcon, Check, CreditCard, Loader2, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { getMeuPerfil } from '@/services/usuario.service'
import { getMeusCartoes, criarCartao, associarEndereco } from '@/services/cartao.service'
import { getMeusEnderecos, criarEndereco } from '@/services/endereco.service'
import { criarReserva } from '@/services/reservas.service'
import { AccessorySelector } from './accessory-selector'
import { BookingStepper } from './booking-stepper'
import { InsuranceSelector } from './insurance-selector'
import { PriceSummary } from './price-summary'

type Step5Phase = 'loading' | 'card-form' | 'address-select' | 'address-form' | 'selection'

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

  // Step 5 — customer data (disabled, from profile)
  const [customerData, setCustomerData] = useState({ fullName: '', phone: '', cpf: '' })
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Step 5 — phase & data
  const [step5Phase, setStep5Phase] = useState<Step5Phase>('loading')
  const [userCards, setUserCards] = useState<Cartao[]>([])
  const [userAddresses, setUserAddresses] = useState<EnderecoCobranca[]>([])
  const [pendingCardId, setPendingCardId] = useState<string | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [cardSaving, setCardSaving] = useState(false)
  const [addressSaving, setAddressSaving] = useState(false)
  const [addressAssociating, setAddressAssociating] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [finalizationError, setFinalizationError] = useState('')

  // Step 5 — new card form
  const [newCardData, setNewCardData] = useState({
    nome: '', numero: '', validade: '', cvv: '', cpf: '',
  })

  // Step 5 — new address form
  const [newAddressData, setNewAddressData] = useState({
    cep: '', logradouro: '', numero: '', semNumero: false,
    complemento: '', estado: '', cidade: '', bairro: '',
  })
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')

  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [reservaId, setReservaId] = useState<string>('')

  // Restore booking state when returning from login redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('step') === '5' && getToken()) {
      const saved = sessionStorage.getItem('booking-state')
      if (saved) {
        const state = JSON.parse(saved)
        if (state.pickupDate) setPickupDate(new Date(state.pickupDate))
        if (state.returnDate) setReturnDate(new Date(state.returnDate))
        if (state.selectedSeguroId) setSelectedSeguroId(state.selectedSeguroId)
        if (state.selectedAcessorios) setSelectedAcessorios(state.selectedAcessorios)
        sessionStorage.removeItem('booking-state')
      }
      setCurrentStep(5)
    }
  }, [])

  // Load profile + cards + addresses when entering step 5
  useEffect(() => {
    if (currentStep !== 5 || profileLoaded) return
    Promise.all([getMeuPerfil(), getMeusCartoes(), getMeusEnderecos()])
      .then(([profile, cards, addresses]) => {
        setCustomerData({
          fullName: profile.nomeCompleto ?? '',
          phone: profile.telefone ?? '',
          cpf: profile.cpf ?? '',
        })
        setUserCards(cards)
        setUserAddresses(addresses)
        setProfileLoaded(true)
        setStep5Phase(cards.length === 0 ? 'card-form' : 'selection')
      })
      .catch(() => {
        setProfileLoaded(true)
        setStep5Phase('card-form')
      })
  }, [currentStep, profileLoaded])

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

  const handleValidarECadastrarCartao = async () => {
    setCardSaving(true)
    // Simulate card validation (1.5s)
    await new Promise((r) => setTimeout(r, 1500))
    try {
      const saved = await criarCartao({
        nome: newCardData.nome,
        numero: newCardData.numero,
        validade: newCardData.validade,
        cpf: newCardData.cpf,
      })
      setUserCards((prev) => [...prev, saved])
      setPendingCardId(saved.id)
      setNewCardData({ nome: '', numero: '', validade: '', cvv: '', cpf: '' })
      setStep5Phase(userAddresses.length === 0 ? 'address-form' : 'address-select')
    } finally {
      setCardSaving(false)
    }
  }

  const handleCepBlur = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, '')
    if (cleaned.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setNewAddressData((prev) => ({
          ...prev,
          logradouro: data.logradouro ?? prev.logradouro,
          bairro: data.bairro ?? prev.bairro,
          cidade: data.localidade ?? prev.cidade,
          estado: data.uf ?? prev.estado,
        }))
      }
    } finally {
      setCepLoading(false)
    }
  }

  const handleCadastrarEndereco = async () => {
    setAddressSaving(true)
    try {
      const saved = await criarEndereco({
        cep: newAddressData.cep,
        logradouro: newAddressData.logradouro,
        numero: newAddressData.numero,
        semNumero: newAddressData.semNumero,
        complemento: newAddressData.complemento,
        estado: newAddressData.estado,
        cidade: newAddressData.cidade,
        bairro: newAddressData.bairro,
      })
      const updatedAddresses = [...userAddresses, saved]
      setUserAddresses(updatedAddresses)
      if (pendingCardId) {
        await associarEndereco(pendingCardId, saved.id)
        setUserCards((prev) =>
          prev.map((c) =>
            c.id === pendingCardId ? { ...c, enderecoCobranca: saved } : c
          )
        )
        setPendingCardId(null)
      }
      setNewAddressData({
        cep: '', logradouro: '', numero: '', semNumero: false,
        complemento: '', estado: '', cidade: '', bairro: '',
      })
      setStep5Phase('selection')
    } finally {
      setAddressSaving(false)
    }
  }

  const handleAddressSelectContinue = async () => {
    if (!selectedAddressId || !pendingCardId) {
      setStep5Phase('selection')
      return
    }
    setAddressAssociating(true)
    try {
      await associarEndereco(pendingCardId, selectedAddressId)
      const addr = userAddresses.find((a) => a.id === selectedAddressId)
      setUserCards((prev) =>
        prev.map((c) =>
          c.id === pendingCardId ? { ...c, enderecoCobranca: addr ?? null } : c
        )
      )
      setPendingCardId(null)
    } finally {
      setAddressAssociating(false)
      setStep5Phase('selection')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return pickupDate && returnDate && days > 0
      case 2: return !!selectedSeguroId
      case 3: return true
      case 4: return true
      case 5: return !!selectedCardId && termsAccepted
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep === 4 && !getToken()) {
      sessionStorage.setItem(
        'booking-state',
        JSON.stringify({
          pickupDate: pickupDate?.toISOString(),
          returnDate: returnDate?.toISOString(),
          selectedSeguroId,
          selectedAcessorios,
        })
      )
      router.push(`/login?redirect=/reservar/${moto.id}?step=5`)
      return
    }
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1)
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
        acessorios: selectedAcessorios.map((a) => ({
          acessorioId: a.acessorioId,
          quantidade: a.quantity,
        })),
      })
      setReservaId(result.id)
      setIsComplete(true)
    } catch {
      setFinalizationError('Erro ao finalizar reserva. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const isCardFormValid =
    newCardData.nome && newCardData.numero && newCardData.validade && newCardData.cvv && newCardData.cpf

  const isAddressFormValid =
    newAddressData.cep && newAddressData.logradouro &&
    newAddressData.estado && newAddressData.cidade && newAddressData.bairro &&
    (newAddressData.semNumero || !!newAddressData.numero)

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center py-12">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Check className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">Reserva Confirmada!</h1>
            <p className="mt-2 text-muted-foreground">
              Sua reserva foi realizada com sucesso. Você receberá um e-mail com todos os detalhes.
            </p>
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Número da reserva</p>
              <p className="text-xl font-bold text-foreground">
                {reservaId ? `RES-${reservaId.slice(-8).toUpperCase()}` : 'RES---------'}
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>{moto.nome} - {days} {days === 1 ? 'dia' : 'dias'}</p>
                <p>
                  {pickupDate && format(pickupDate, "dd 'de' MMMM", { locale: ptBR })} -{' '}
                  {returnDate && format(returnDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild><Link href="/conta/reservas">Ver Minhas Reservas</Link></Button>
              <Button variant="outline" asChild><Link href="/">Voltar ao Início</Link></Button>
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
                        <h2 className="text-xl font-bold text-foreground">Selecione as Datas</h2>
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
                                className={cn('w-full justify-start text-left font-normal', !pickupDate && 'text-muted-foreground')}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {pickupDate ? format(pickupDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione a data'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} disabled={(date) => date < new Date()} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Data de Devolução</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn('w-full justify-start text-left font-normal', !returnDate && 'text-muted-foreground')}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {returnDate ? format(returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione a data'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} disabled={(date) => date < (pickupDate || new Date())} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      {days > 0 && (
                        <div className="rounded-lg bg-muted p-4 text-center">
                          <p className="text-sm text-muted-foreground">Duração do aluguel</p>
                          <p className="text-2xl font-bold text-foreground">{days} {days === 1 ? 'dia' : 'dias'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Seguro */}
                  {currentStep === 2 && (
                    <InsuranceSelector seguros={seguros} selectedId={selectedSeguroId} onSelect={setSelectedSeguroId} />
                  )}

                  {/* Step 3: Acessórios */}
                  {currentStep === 3 && (
                    <AccessorySelector acessorios={acessorios} selected={selectedAcessorios} onUpdate={handleAcessorioUpdate} />
                  )}

                  {/* Step 4: Resumo */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Confirme sua Reserva</h2>
                        <p className="mt-1 text-muted-foreground">Revise os detalhes antes de continuar</p>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-border p-4">
                          <p className="text-sm text-muted-foreground">Moto</p>
                          <p className="font-medium text-foreground">{moto.nome}</p>
                        </div>
                        <div className="rounded-lg border border-border p-4">
                          <p className="text-sm text-muted-foreground">Período</p>
                          <p className="font-medium text-foreground">
                            {pickupDate && format(pickupDate, "dd 'de' MMMM", { locale: ptBR })} -{' '}
                            {returnDate && format(returnDate, "dd 'de' MMMM", { locale: ptBR })} ({days} {days === 1 ? 'dia' : 'dias'})
                          </p>
                        </div>
                        <div className="rounded-lg border border-border p-4">
                          <p className="text-sm text-muted-foreground">Seguro</p>
                          <p className="font-medium text-foreground">{selectedSeguro?.nome}</p>
                        </div>
                        {acessoriosWithDetails.length > 0 && (
                          <div className="rounded-lg border border-border p-4">
                            <p className="text-sm text-muted-foreground">Acessórios</p>
                            <p className="font-medium text-foreground">
                              {acessoriosWithDetails.map((item) => `${item.acessorio.nome} x${item.quantity}`).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Dados + Cartão + Endereço + Termos */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Confirmação de Dados</h2>
                        <p className="mt-1 text-muted-foreground">Seus dados e informações de pagamento</p>
                      </div>

                      {/* Loading */}
                      {step5Phase === 'loading' && (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      {/* Dados do cliente (sempre visível após loading) */}
                      {step5Phase !== 'loading' && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input id="fullName" value={customerData.fullName} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" value={customerData.phone} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" value={customerData.cpf} disabled />
                          </div>
                        </div>
                      )}

                      {/* Cadastro de cartão */}
                      {step5Phase === 'card-form' && (
                        <div className="border-t border-border pt-6">
                          <div className="mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-base font-semibold text-foreground">Dados do Cartão</h3>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="cardNome">Nome no Cartão</Label>
                              <Input
                                id="cardNome"
                                value={newCardData.nome}
                                onChange={(e) => setNewCardData((p) => ({ ...p, nome: e.target.value }))}
                                placeholder="Como aparece no cartão"
                              />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="cardNumero">Número do Cartão</Label>
                              <Input
                                id="cardNumero"
                                value={newCardData.numero}
                                onChange={(e) => setNewCardData((p) => ({ ...p, numero: e.target.value }))}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cardValidade">Validade</Label>
                              <Input
                                id="cardValidade"
                                value={newCardData.validade}
                                onChange={(e) => setNewCardData((p) => ({ ...p, validade: e.target.value }))}
                                placeholder="MM/AA"
                                maxLength={5}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cardCvv">CVV</Label>
                              <Input
                                id="cardCvv"
                                value={newCardData.cvv}
                                onChange={(e) => setNewCardData((p) => ({ ...p, cvv: e.target.value }))}
                                placeholder="000"
                                maxLength={4}
                              />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="cardCpf">CPF do Titular</Label>
                              <Input
                                id="cardCpf"
                                value={newCardData.cpf}
                                onChange={(e) => setNewCardData((p) => ({ ...p, cpf: e.target.value }))}
                                placeholder="000.000.000-00"
                              />
                            </div>
                          </div>
                          <Button
                            className="mt-4 w-full gap-2"
                            onClick={handleValidarECadastrarCartao}
                            disabled={!isCardFormValid || cardSaving}
                          >
                            {cardSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Validando cartão...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4" />
                                Cadastrar Cartão
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Endereço de cobrança — seleção de existente */}
                      {step5Phase === 'address-select' && (
                        <div className="border-t border-border pt-6">
                          <div className="mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-base font-semibold text-foreground">Endereço de Cobrança</h3>
                          </div>
                          {userAddresses.length > 0 ? (
                            <>
                              <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um endereço" />
                                </SelectTrigger>
                                <SelectContent>
                                  {userAddresses.map((addr) => (
                                    <SelectItem key={addr.id} value={addr.id}>
                                      {addr.logradouro}{addr.numero ? `, ${addr.numero}` : ''} — {addr.cidade}/{addr.estado}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="mt-4 flex gap-3">
                                <Button
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => setStep5Phase('address-form')}
                                >
                                  <Plus className="h-4 w-4" />
                                  Cadastrar novo endereço
                                </Button>
                                <Button
                                  className="flex-1"
                                  disabled={!selectedAddressId || addressAssociating}
                                  onClick={handleAddressSelectContinue}
                                >
                                  {addressAssociating ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                                  ) : 'Continuar'}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <Button className="w-full gap-2" onClick={() => setStep5Phase('address-form')}>
                              <Plus className="h-4 w-4" />
                              Cadastrar novo endereço
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Endereço de cobrança — cadastro de novo */}
                      {step5Phase === 'address-form' && (
                        <div className="border-t border-border pt-6">
                          <div className="mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-base font-semibold text-foreground">Novo Endereço de Cobrança</h3>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="cep">CEP</Label>
                              <div className="relative">
                                <Input
                                  id="cep"
                                  value={newAddressData.cep}
                                  onChange={(e) => setNewAddressData((p) => ({ ...p, cep: e.target.value }))}
                                  onBlur={(e) => handleCepBlur(e.target.value)}
                                  placeholder="00000-000"
                                  maxLength={9}
                                />
                                {cepLoading && (
                                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="logradouro">Endereço</Label>
                              <Input
                                id="logradouro"
                                value={newAddressData.logradouro}
                                onChange={(e) => setNewAddressData((p) => ({ ...p, logradouro: e.target.value }))}
                                placeholder="Rua, Avenida..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="numero">Número</Label>
                              <Input
                                id="numero"
                                value={newAddressData.numero}
                                onChange={(e) => setNewAddressData((p) => ({ ...p, numero: e.target.value }))}
                                placeholder="123"
                                disabled={newAddressData.semNumero}
                              />
                            </div>
                            <div className="flex items-end space-y-2 pb-1">
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-border"
                                  checked={newAddressData.semNumero}
                                  onChange={(e) =>
                                    setNewAddressData((p) => ({
                                      ...p,
                                      semNumero: e.target.checked,
                                      numero: e.target.checked ? '' : p.numero,
                                    }))
                                  }
                                />
                                Sem número
                              </label>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="complemento">Complemento</Label>
                              <Input
                                id="complemento"
                                value={newAddressData.complemento}
                                onChange={(e) => setNewAddressData((p) => ({ ...p, complemento: e.target.value }))}
                                placeholder="Apto, Bloco... (opcional)"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="estado">Estado</Label>
                              <Input
                                id="estado"
                                value={newAddressData.estado}
                                onChange={(e) => setNewAddressData((p) => ({ ...p, estado: e.target.value }))}
                                placeholder="SP"
                                maxLength={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cidade">Cidade</Label>
                              <Input
                                id="cidade"
                                value={newAddressData.cidade}
                                onChange={(e) => setNewAddressData((p) => ({ ...p, cidade: e.target.value }))}
                                placeholder="São Paulo"
                              />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="bairro">Bairro</Label>
                              <Input
                                id="bairro"
                                value={newAddressData.bairro}
                                onChange={(e) => setNewAddressData((p) => ({ ...p, bairro: e.target.value }))}
                                placeholder="Centro"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setStep5Phase(userAddresses.length > 0 ? 'address-select' : 'card-form')}
                            >
                              Voltar
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={handleCadastrarEndereco}
                              disabled={!isAddressFormValid || addressSaving}
                            >
                              {addressSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                              ) : 'Cadastrar Endereço'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Seleção de cartão + Termos */}
                      {step5Phase === 'selection' && (
                        <>
                          {/* Lista de cartões */}
                          <div className="border-t border-border pt-6">
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-base font-semibold text-foreground">Selecionar Cartão</h3>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => {
                                  setStep5Phase('card-form')
                                }}
                              >
                                <Plus className="h-3 w-3" />
                                Novo cartão
                              </Button>
                            </div>
                            <RadioGroup value={selectedCardId ?? ''} onValueChange={setSelectedCardId}>
                              {userCards.map((card) => (
                                <label
                                  key={card.id}
                                  className={cn(
                                    'flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors',
                                    selectedCardId === card.id && 'border-primary bg-primary/5'
                                  )}
                                >
                                  <RadioGroupItem value={card.id} id={card.id} />
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">{card.nome}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {card.numeroMascarado} &bull; Validade {card.validade}
                                    </p>
                                    {card.enderecoCobranca && (
                                      <p className="text-xs text-muted-foreground">
                                        {card.enderecoCobranca.logradouro}{card.enderecoCobranca.numero ? `, ${card.enderecoCobranca.numero}` : ''} — {card.enderecoCobranca.cidade}
                                      </p>
                                    )}
                                  </div>
                                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </label>
                              ))}
                            </RadioGroup>
                          </div>

                          {/* Termos de uso */}
                          <div className="border-t border-border pt-6">
                            <h3 className="mb-3 text-base font-semibold text-foreground">Termos de Uso</h3>
                            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                              <p>
                                Ao prosseguir, você concorda com os Termos e Condições de uso do serviço de aluguel de motos.
                                O locatário é responsável por devolver o veículo nas condições originais.
                                Em caso de danos, a caução poderá ser utilizada para cobertura dos custos.
                                Os termos completos serão fornecidos em breve.
                              </p>
                            </div>
                            <label className="mt-4 flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 rounded border-border"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                              />
                              <span className="text-sm text-foreground">
                                Li e aceito os Termos e Condições de uso
                              </span>
                            </label>
                          </div>
                        </>
                      )}
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

                    {currentStep < steps.length && (
                      <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                        Continuar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}

                    {currentStep === steps.length && step5Phase === 'selection' && (
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
