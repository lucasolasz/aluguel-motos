'use client'

import { useEffect, useState } from 'react'
import type { Cartao, EnderecoCobranca } from '@/lib/types'
import {
  associarEndereco,
  criarCartao,
  getMeusCartoes,
} from '@/services/cartao.service'
import {
  criarEndereco,
  getMeusEnderecos,
} from '@/services/endereco.service'
import { getMeuPerfil } from '@/services/usuario.service'

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

  const [addressSaving, setAddressSaving] = useState(false)
  const [addressAssociating, setAddressAssociating] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)

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

  const handleValidarECadastrarCartao = () => {
    setNewCardPending(true)
    setStep5Phase(userAddresses.length === 0 ? 'address-form' : 'address-select')
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

  const requestAddressForCard = (cardId: string) => {
    setPendingCardId(cardId)
    setStep5Phase(userAddresses.length > 0 ? 'address-select' : 'address-form')
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
    addressSaving,
    addressAssociating,
    cepLoading,
    newCardData,
    setNewCardData,
    newAddressData,
    setNewAddressData,
    handleValidarECadastrarCartao,
    handleCepBlur,
    handleCadastrarEndereco,
    handleAddressSelectContinue,
    isCardFormValid,
    isAddressFormValid,
    isReady,
    requestAddressForCard,
    goToCardForm,
    goToAddressForm,
    backFromAddressForm,
  }
}

export type Step5Controller = ReturnType<typeof useStep5>
