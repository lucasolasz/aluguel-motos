'use client'

import { useEffect, useState } from 'react'
import type { Cartao, EnderecoCobranca } from '@/lib/types'
import {
  associarEndereco,
  criarCartao,
  deletarCartao,
  getMeusCartoes,
  validarCartao,
} from '@/services/cartao.service'
import {
  criarEndereco,
  getMeusEnderecos,
} from '@/services/endereco.service'
import { getMeuPerfil } from '@/services/usuario.service'
import { getCidadesByEstado } from '@/services/ibge.service'
import type { Cidade } from '@/services/ibge.service'

export type Step5Phase =
  | 'loading'
  | 'card-form'
  | 'address-select'
  | 'address-form'
  | 'selection'

export interface CustomerData {
  fullName: string
  phone: string
  cpf: string
}

export interface NewCardData {
  nome: string
  numero: string
  validade: string
  cvv: string
  cpf: string
}

export interface NewAddressData {
  cep: string
  logradouro: string
  numero: string
  semNumero: boolean
  complemento: string
  estado: string
  cidade: string
  bairro: string
}

const INITIAL_CARD: NewCardData = {
  nome: '', numero: '', validade: '', cvv: '', cpf: '',
}

const INITIAL_ADDRESS: NewAddressData = {
  cep: '', logradouro: '', numero: '', semNumero: false,
  complemento: '', estado: '', cidade: '', bairro: '',
}

interface UseStep5Args {
  active: boolean
}

export function useStep5({ active }: UseStep5Args) {
  const [customerData, setCustomerData] = useState<CustomerData>({
    fullName: '', phone: '', cpf: '',
  })
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [step5Phase, setStep5Phase] = useState<Step5Phase>('loading')

  const [userCards, setUserCards] = useState<Cartao[]>([])
  const [userAddresses, setUserAddresses] = useState<EnderecoCobranca[]>([])

  const [pendingCardId, setPendingCardId] = useState<string | null>(null)
  const [newCardPending, setNewCardPending] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')

  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [cardError, setCardError] = useState<string | null>(null)

  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)
  const [addressSaving, setAddressSaving] = useState(false)
  const [addressAssociating, setAddressAssociating] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cidadesLoading, setCidadesLoading] = useState(false)

  const [cidades, setCidades] = useState<Cidade[]>([])

  const [newCardData, setNewCardData] = useState<NewCardData>(INITIAL_CARD)
  const [newAddressData, setNewAddressData] = useState<NewAddressData>(INITIAL_ADDRESS)

  useEffect(() => {
    if (!active || profileLoaded) return
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
        const orphaned = cards.find((c) => c.enderecoCobranca === null)
        if (cards.length === 0) {
          setStep5Phase('card-form')
        } else if (orphaned) {
          setPendingCardId(orphaned.id)
          setStep5Phase(addresses.length > 0 ? 'address-select' : 'address-form')
        } else {
          setStep5Phase('selection')
        }
      })
      .catch(() => {
        setProfileLoaded(true)
        setStep5Phase('card-form')
      })
  }, [active, profileLoaded])

  useEffect(() => {
    if (!active && step5Phase === 'card-form' && userCards.length > 0) {
      setStep5Phase('selection')
      setNewCardData(INITIAL_CARD)
      setNewCardPending(false)
      setCardError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const handleValidarECadastrarCartao = async () => {
    setCardError(null)
    setValidationStatus('loading')
    setValidationDialogOpen(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    try {
      await validarCartao(newCardData.numero)
      setValidationStatus('success')
    } catch (error) {
      const msg = error instanceof Error ? error.message : ''
      setCardError(
        msg.includes('já cadastrado')
          ? 'Este cartão já está cadastrado. Use outro número de cartão.'
          : 'Erro ao validar cartão. Tente novamente.'
      )
      setValidationStatus('error')
    }
  }

  const confirmValidation = () => {
    setValidationDialogOpen(false)
    setNewCardPending(true)
    setStep5Phase(userAddresses.length === 0 ? 'address-form' : 'address-select')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeValidationDialog = () => {
    setValidationDialogOpen(false)
  }

  const handleCepBlur = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, '')
    if (cleaned.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
      const data = await res.json()
      if (!data.erro) {
        const estado = (data.uf ?? '').toUpperCase()
        const cidadeViacep = data.localidade ?? ''
        const bairroViacep = (data.bairro ?? '').toUpperCase()
        const cidadeNome = cidadeViacep.toUpperCase()
        
        setNewAddressData((prev) => ({
          ...prev,
          logradouro: (data.logradouro ?? prev.logradouro).toUpperCase(),
          bairro: bairroViacep,
          cidade: cidadeNome,
          estado,
        }))
        
        setCidadesLoading(true)
        try {
          const cidadesData = await getCidadesByEstado(estado)
          const cidadeExiste = cidadesData.some((c) => c.nome.toUpperCase() === cidadeNome)
          const cidadesComCidadeViacep = cidadeExiste
            ? cidadesData
            : [...cidadesData, { id: 0, nome: cidadeViacep }]
          setCidades(cidadesComCidadeViacep)
        } catch {
          setCidades([])
        }
        setCidadesLoading(false)
      }
    } finally {
      setCepLoading(false)
    }
  }

  const handleEstadoChange = async (estado: string) => {
    setNewAddressData((prev) => ({ ...prev, estado: estado.toUpperCase(), cidade: '', bairro: '' }))
    setCidades([])
    if (!estado) return
    setCidadesLoading(true)
    const result = await getCidadesByEstado(estado)
    setCidades(result)
    setCidadesLoading(false)
  }

  const handleCidadeChange = async (cidadeNome: string) => {
    setNewAddressData((prev) => ({ ...prev, cidade: cidadeNome, bairro: '' }))
  }

  const handleCadastrarEndereco = async () => {
    setAddressSaving(true)
    try {
      let cardId = pendingCardId

      if (newCardPending) {
        const newCard = await criarCartao({
          nome: newCardData.nome,
          numero: newCardData.numero.replace(/\s/g, ''),
          validade: newCardData.validade,
          cpf: newCardData.cpf.replace(/\D/g, ''),
        })
        setUserCards((prev) => [...prev, newCard])
        cardId = newCard.id
        setNewCardPending(false)
        setNewCardData(INITIAL_CARD)
      }

      const savedAddress = await criarEndereco({
        cep: newAddressData.cep.replace(/\D/g, ''),
        logradouro: newAddressData.logradouro,
        numero: newAddressData.numero,
        semNumero: newAddressData.semNumero,
        complemento: newAddressData.complemento,
        estado: newAddressData.estado,
        cidade: newAddressData.cidade,
        bairro: newAddressData.bairro,
      })
      setUserAddresses((prev) => [...prev, savedAddress])

      if (cardId) {
        await associarEndereco(cardId, savedAddress.id)
        setUserCards((prev) =>
          prev.map((c) => c.id === cardId ? { ...c, enderecoCobranca: savedAddress } : c)
        )
        setPendingCardId(null)
      }

      setNewAddressData(INITIAL_ADDRESS)
      setStep5Phase('selection')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setAddressSaving(false)
    }
  }

  const handleAddressSelectContinue = async () => {
    if (!selectedAddressId && !newCardPending && !pendingCardId) {
      setStep5Phase('selection')
      return
    }
    setAddressAssociating(true)
    try {
      let cardId = pendingCardId

      if (newCardPending) {
        const newCard = await criarCartao({
          nome: newCardData.nome,
          numero: newCardData.numero.replace(/\s/g, ''),
          validade: newCardData.validade,
          cpf: newCardData.cpf.replace(/\D/g, ''),
        })
        setUserCards((prev) => [...prev, newCard])
        cardId = newCard.id
        setNewCardPending(false)
        setNewCardData(INITIAL_CARD)
      }

      if (cardId && selectedAddressId) {
        await associarEndereco(cardId, selectedAddressId)
        const addr = userAddresses.find((a) => a.id === selectedAddressId)
        setUserCards((prev) =>
          prev.map((c) => c.id === cardId ? { ...c, enderecoCobranca: addr ?? null } : c)
        )
        setPendingCardId(null)
      }
    } finally {
      setAddressAssociating(false)
      setStep5Phase('selection')
    }
  }

  const isCardFormValid =
    newCardData.nome.trim().length > 0 &&
    newCardData.numero.replace(/\D/g, '').length === 16 &&
    newCardData.validade.replace(/\D/g, '').length === 4 &&
    newCardData.cvv.replace(/\D/g, '').length === 3 &&
    newCardData.cpf.replace(/\D/g, '').length === 11

  const isAddressFormValid =
    !!newAddressData.cep && !!newAddressData.logradouro &&
    !!newAddressData.estado && !!newAddressData.cidade && !!newAddressData.bairro &&
    (newAddressData.semNumero || !!newAddressData.numero)

  const selectedCard = userCards.find((c) => c.id === selectedCardId)
  const isReady = !!selectedCardId && termsAccepted && selectedCard?.enderecoCobranca != null

  const handleDeleteCard = async (cardId: string) => {
    setDeletingCardId(cardId)
    try {
      await deletarCartao(cardId)
      const updated = userCards.filter((c) => c.id !== cardId)
      setUserCards(updated)
      if (selectedCardId === cardId) setSelectedCardId(null)
      if (updated.length === 0) setStep5Phase('card-form')
    } finally {
      setDeletingCardId(null)
    }
  }

  const requestAddressForCard = (cardId: string) => {
    setPendingCardId(cardId)
    setStep5Phase(userAddresses.length > 0 ? 'address-select' : 'address-form')
  }

  const backFromCardForm = () => {
    setNewCardData(INITIAL_CARD)
    setNewCardPending(false)
    setCardError(null)
    setStep5Phase('selection')
  }

  const goToCardForm = () => setStep5Phase('card-form')
  const goToAddressForm = () => setStep5Phase('address-form')

  const backFromAddressForm = () => {
    if (userAddresses.length > 0) {
      setStep5Phase('address-select')
    } else if (pendingCardId) {
      setStep5Phase('selection')
    } else {
      setStep5Phase('card-form')
    }
  }

  return {
    customerData,
    step5Phase,
    userCards,
    userAddresses,
    selectedCardId,
    setSelectedCardId,
    termsAccepted,
    setTermsAccepted,
    selectedAddressId,
    setSelectedAddressId,
    pendingCardId,
    validationDialogOpen,
    validationStatus,
    cardError,
    confirmValidation,
    closeValidationDialog,
    addressSaving,
    addressAssociating,
    cepLoading,
    cidadesLoading,
    cidades,
    newCardData,
    setNewCardData,
    newAddressData,
    setNewAddressData,
    handleValidarECadastrarCartao,
    handleCepBlur,
    handleEstadoChange,
    handleCidadeChange,
    handleCadastrarEndereco,
    handleAddressSelectContinue,
    isCardFormValid,
    isAddressFormValid,
    isReady,
    handleDeleteCard,
    deletingCardId,
    requestAddressForCard,
    backFromCardForm,
    goToCardForm,
    goToAddressForm,
    backFromAddressForm,
  }
}

export type Step5Controller = ReturnType<typeof useStep5>
