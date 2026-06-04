'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card'
import { CnhFields, validarCnh, type CnhValues } from '@/components/cnh-fields'
import { MaskedInput } from './masked-input'
import { registrarCompleto } from '@/services/auth.service'
import { validarCartaoCompleto, validarEnderecoCompleto } from '@/lib/validations'
import { montarTelefone, type DadosPessoais } from './dados-form'
import { AddressFields, EMPTY_ADDRESS, type AddressData } from '@/components/address-fields'

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

interface Step3Props {
  dados: DadosPessoais
}

export function Step3Conclusao({ dados }: Step3Props) {
  const router = useRouter()
  const [cnh, setCnh] = useState<CnhValues>(EMPTY_CNH)
  const [card, setCard] = useState<CardData>(EMPTY_CARD)
  const [address, setAddress] = useState<AddressData>({ ...EMPTY_ADDRESS })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function patchCnh(p: Partial<CnhValues>) {
    setCnh((prev) => ({ ...prev, ...p }))
  }

  function patchAddress(p: Partial<AddressData>) {
    setAddress((prev) => ({ ...prev, ...p }))
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
      await registrarCompleto({
        username: dados.email,
        password: dados.senha,
        nomeCompleto: dados.nomeCompleto,
        telefone: montarTelefone(dados),
        cpf: dados.cpf.replace(/\D/g, ''),
        genero: dados.genero as 'FEMININO' | 'MASCULINO' | 'OUTRO',
        cnh: {
          rg: cnh.rg,
          dataNascimento: cnhResult.dataNascimentoIso,
          numeroRegistro: cnh.numeroRegistro,
          numeroCnh: cnh.numeroCnh,
          dataValidade: cnhResult.dataValidadeIso,
          estado: cnh.estado,
        },
        cartao: {
          nome: card.nome,
          cpf: card.cpf.replace(/\D/g, ''),
          numero: card.numero.replace(/\s/g, ''),
          validade: card.validade,
        },
        endereco: {
          cep: address.cep.replace(/\D/g, ''),
          logradouro: address.logradouro,
          numero: address.numero,
          semNumero: address.semNumero,
          complemento: address.complemento,
          estado: address.estado,
          cidade: address.cidade,
          bairro: address.bairro,
        },
        enderecoUsuario: {
          cep: dados.endereco.cep.replace(/\D/g, ''),
          logradouro: dados.endereco.logradouro,
          numero: dados.endereco.numero,
          semNumero: dados.endereco.semNumero,
          complemento: dados.endereco.complemento,
          estado: dados.endereco.estado,
          cidade: dados.endereco.cidade,
          bairro: dados.endereco.bairro,
        },
      })
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao concluir o cadastro. Verifique os dados e tente novamente.')
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
          <AddressFields value={address} onChange={patchAddress} />
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
