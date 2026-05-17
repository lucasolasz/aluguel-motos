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
import { getCidadesByEstado, getBairrosByCidade } from '@/services/ibge.service'
import type { Cidade, Bairro } from '@/services/ibge.service'

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
  const [cidadesLoading, setCidadesLoading] = useState(false)
  const [bairrosLoading, setBairrosLoading] = useState(false)

  const [cidades, setCidades] = useState<Cidade[]>([])
  const [bairros, setBairros] = useState<Bairro[]>([])

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
        const estado = (data.uf ?? '').toUpperCase()
        const cidadeViacep = data.localidade ?? ''
        const bairroViacep = data.bairro ?? ''
        const cidadeNome = cidadeViacep.toUpperCase()
        const bairroNome = bairroViacep.toUpperCase()
        
        setNewAddressData((prev) => ({
          ...prev,
          logradouro: (data.logradouro ?? prev.logradouro).toUpperCase(),
          bairro: bairroNome,
          cidade: cidadeNome,
          estado,
        }))
        
        setCidadesLoading(true)
        setBairrosLoading(true)
        
        let cidadesData: { id: number; nome: string }[] = []
        let distritosData: { nome: string }[] = []
        
        try {
          [cidadesData, distritosData] = await Promise.all([
            getCidadesByEstado(estado),
            getBairrosByCidade(cidadeViacep, estado),
          ])
        } catch {
          // IBGE API falhou, usa só os dados do ViaCEP
        }
        
        const bairroExiste = distritosData.some((d) => d.nome.toUpperCase() === bairroNome)
        const distritosComBairroViacep = bairroExiste
          ? distritosData
          : [...distritosData, { nome: bairroViacep }]
        
        const cidadeExiste = cidadesData.some((c) => c.nome.toUpperCase() === cidadeNome)
        const cidadesComCidadeViacep = cidadeExiste
          ? cidadesData
          : [...cidadesData, { id: 0, nome: cidadeViacep }]
        
        setCidades(cidadesComCidadeViacep)
        setBairros(distritosComBairroViacep)
        setCidadesLoading(false)
        setBairrosLoading(false)
      }
    } finally {
      setCepLoading(false)
    }
  }

  const handleEstadoChange = async (estado: string) => {
    setNewAddressData((prev) => ({ ...prev, estado: estado.toUpperCase(), cidade: '', bairro: '' }))
    setCidades([])
    setBairros([])
    if (!estado) return
    setCidadesLoading(true)
    const result = await getCidadesByEstado(estado)
    setCidades(result)
    setCidadesLoading(false)
  }

  const handleCidadeChange = async (cidadeNome: string) => {
    setNewAddressData((prev) => ({ ...prev, cidade: cidadeNome, bairro: '' }))
    setBairros([])
    const estado = newAddressData.estado
    if (!cidadeNome || !estado) return
    const cidadeOriginal = cidades.find((c) => c.nome.toUpperCase() === cidadeNome)?.nome ?? cidadeNome
    setBairrosLoading(true)
    const result = await getBairrosByCidade(cidadeOriginal, estado)
    setBairros(result)
    setBairrosLoading(false)
  }

  const handleBairroChange = (bairro: string) => {
    setNewAddressData((prev) => ({ ...prev, bairro: bairro.toUpperCase() }))
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
    cidadesLoading,
    bairrosLoading,
    cidades,
    bairros,
    newCardData,
    setNewCardData,
    newAddressData,
    setNewAddressData,
    handleValidarECadastrarCartao,
    handleCepBlur,
    handleEstadoChange,
    handleCidadeChange,
    handleBairroChange,
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
