'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CnhFields, validarCnh, type CnhValues } from '@/components/cnh-fields'
import { MaskedInput } from './masked-input'
import { salvarCnh } from '@/services/cnh.service'
import { criarCartao } from '@/services/cartao.service'
import { criarEndereco } from '@/services/endereco.service'
import { associarEndereco } from '@/services/cartao.service'
import { getCidadesByEstado, type Cidade } from '@/services/ibge.service'
import { validarCartaoCompleto, validarEnderecoCompleto } from '@/lib/validations'
import { ESTADOS_BRASIL } from '@/lib/estados'

const EMPTY_CNH: CnhValues = {
  rg: '',
  dataNascimento: '',
  numeroRegistro: '',
  numeroCnh: '',
  dataValidade: '',
  estado: '',
}

interface CardData {
  nome: string
  numero: string
  validade: string
  cvv: string
  cpf: string
}

const EMPTY_CARD: CardData = { nome: '', numero: '', validade: '', cvv: '', cpf: '' }

interface AddressData {
  cep: string
  logradouro: string
  numero: string
  semNumero: boolean
  complemento: string
  estado: string
  cidade: string
  bairro: string
}

const EMPTY_ADDRESS: AddressData = {
  cep: '',
  logradouro: '',
  numero: '',
  semNumero: false,
  complemento: '',
  estado: '',
  cidade: '',
  bairro: '',
}

export function Step3Conclusao() {
  const router = useRouter()
  const [cnh, setCnh] = useState<CnhValues>(EMPTY_CNH)
  const [card, setCard] = useState<CardData>(EMPTY_CARD)
  const [address, setAddress] = useState<AddressData>(EMPTY_ADDRESS)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cidadesLoading, setCidadesLoading] = useState(false)
  const [cidades, setCidades] = useState<Cidade[]>([])

  function patchCnh(p: Partial<CnhValues>) {
    setCnh((prev) => ({ ...prev, ...p }))
  }

  function patchAddress(p: Partial<AddressData>) {
    setAddress((prev) => ({ ...prev, ...p }))
  }

  async function handleCepBlur(cep: string) {
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

        setAddress((prev) => ({
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

  async function handleEstadoChange(estado: string) {
    setAddress((prev) => ({ ...prev, estado: estado.toUpperCase(), cidade: '', bairro: '' }))
    setCidades([])
    if (!estado) return
    setCidadesLoading(true)
    const result = await getCidadesByEstado(estado)
    setCidades(result)
    setCidadesLoading(false)
  }

  async function handleConcluir() {
    setError('')
    const cnhResult = validarCnh(cnh)
    if (!cnhResult.ok) {
      setError(cnhResult.error)
      return
    }
    const cardErr = validarCartaoCompleto(card)
    if (cardErr) {
      setError(cardErr)
      return
    }
    const addressErr = validarEnderecoCompleto(address)
    if (addressErr) {
      setError(addressErr)
      return
    }
    setSubmitting(true)
    try {
      await salvarCnh({
        rg: cnh.rg,
        dataNascimento: cnhResult.dataNascimentoIso,
        numeroRegistro: cnh.numeroRegistro,
        numeroCnh: cnh.numeroCnh,
        dataValidade: cnhResult.dataValidadeIso,
        estado: cnh.estado,
      })
      const newCard = await criarCartao({
        nome: card.nome,
        cpf: card.cpf.replace(/\D/g, ''),
        numero: card.numero.replace(/\s/g, ''),
        validade: card.validade,
      })
      const savedAddress = await criarEndereco({
        cep: address.cep.replace(/\D/g, ''),
        logradouro: address.logradouro,
        numero: address.numero,
        semNumero: address.semNumero,
        complemento: address.complemento,
        estado: address.estado,
        cidade: address.cidade,
        bairro: address.bairro,
      })
      await associarEndereco(newCard.id, savedAddress.id)
      setDone(true)
    } catch {
      setError('Erro ao concluir o cadastro. Verifique os dados e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-xl font-semibold text-foreground">Cadastro concluído!</h2>
        <p className="text-muted-foreground">
          Sua conta foi criada e seus documentos foram registrados.
        </p>
        <Button onClick={() => router.push('/conta')}>Ir para Minha Conta</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Conclusão do Cadastro</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha os dados da sua carteira de motorista, cartão e endereço de cobrança para finalizar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carteira de Motorista (CNH)</CardTitle>
        </CardHeader>
        <CardContent>
          <CnhFields values={cnh} onChange={patchCnh} idPrefix="cnh-" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Cartão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cardNome">Nome no Cartão</Label>
              <Input
                id="cardNome"
                value={card.nome}
                onChange={(e) => setCard((p) => ({ ...p, nome: e.target.value.toUpperCase() }))}
                placeholder="COMO APARECE NO CARTÃO"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cardNumero">Número do Cartão</Label>
              <MaskedInput
                id="cardNumero"
                mask="0000 0000 0000 0000"
                value={card.numero}
                onAccept={(v) => setCard((p) => ({ ...p, numero: v }))}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardValidade">Validade</Label>
              <MaskedInput
                id="cardValidade"
                mask="00/00"
                value={card.validade}
                onAccept={(v) => setCard((p) => ({ ...p, validade: v }))}
                placeholder="MM/AA"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardCvv">CVV</Label>
              <MaskedInput
                id="cardCvv"
                mask="0000"
                value={card.cvv}
                onAccept={(v) => setCard((p) => ({ ...p, cvv: v }))}
                placeholder="000"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cardCpf">CPF do Titular</Label>
              <MaskedInput
                id="cardCpf"
                mask="000.000.000-00"
                value={card.cpf}
                onAccept={(v) => setCard((p) => ({ ...p, cpf: v }))}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            Endereço de Cobrança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="relative">
                <MaskedInput
                  id="cep"
                  mask="00000-000"
                  value={address.cep}
                  onAccept={(val) => patchAddress({ cep: val })}
                  onBlur={(e) => handleCepBlur(e.target.value)}
                  placeholder="00000-000"
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
                value={address.logradouro}
                onChange={(e) => patchAddress({ logradouro: e.target.value.toUpperCase() })}
                placeholder="RUA, AVENIDA..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={address.numero}
                onChange={(e) => patchAddress({ numero: e.target.value.replace(/\D/g, '') })}
                placeholder="123"
                disabled={address.semNumero}
              />
            </div>
            <div className="flex items-end space-y-2 pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={address.semNumero}
                  onChange={(e) =>
                    patchAddress({
                      semNumero: e.target.checked,
                      numero: e.target.checked ? '' : address.numero,
                    })
                  }
                />
                Sem número
              </label>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={address.complemento}
                onChange={(e) => patchAddress({ complemento: e.target.value.toUpperCase() })}
                placeholder="APTO, BLOCO... (OPCIONAL)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={address.estado} onValueChange={handleEstadoChange}>
                <SelectTrigger className="w-full">
                  {cidadesLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SelectValue placeholder="SEL" />
                  )}
                </SelectTrigger>
                <SelectContent position="popper">
                  {ESTADOS_BRASIL.map((estado) => (
                    <SelectItem key={estado.sigla} value={estado.sigla}>
                      {estado.sigla} - {estado.nome.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Select
                value={address.cidade}
                onValueChange={(v) => patchAddress({ cidade: v })}
                disabled={!address.estado || cidadesLoading}
              >
                <SelectTrigger className="w-full">
                  {cidadesLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SelectValue placeholder="CIDADE" />
                  )}
                </SelectTrigger>
                <SelectContent position="popper">
                  {cidades.map((cidade) => (
                    <SelectItem key={cidade.id} value={cidade.nome.toUpperCase()}>
                      {cidade.nome.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={address.bairro}
                onChange={(e) => patchAddress({ bairro: e.target.value.toUpperCase() })}
                placeholder="CENTRO"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleConcluir} disabled={submitting}>
          {submitting ? 'Concluindo...' : 'Concluir cadastro'}
        </Button>
      </div>
    </div>
  )
}
