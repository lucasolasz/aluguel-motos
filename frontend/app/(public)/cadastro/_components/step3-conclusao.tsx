'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card'
import { CnhFields, validarCnh, type CnhValues } from '@/components/cnh-fields'
import { MaskedInput } from './masked-input'
import { salvarCnh } from '@/services/cnh.service'
import { criarCartao } from '@/services/cartao.service'

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

function validarCartao(c: CardData): string | null {
  if (!c.nome.trim()) return 'Informe o nome impresso no cartão.'
  if (c.numero.replace(/\D/g, '').length !== 16) return 'Número do cartão inválido.'
  if (c.validade.replace(/\D/g, '').length !== 4) return 'Validade do cartão inválida.'
  if (c.cvv.replace(/\D/g, '').length < 3) return 'CVV inválido.'
  if (c.cpf.replace(/\D/g, '').length !== 11) return 'CPF do titular inválido.'
  return null
}

export function Step3Conclusao() {
  const router = useRouter()
  const [cnh, setCnh] = useState<CnhValues>(EMPTY_CNH)
  const [card, setCard] = useState<CardData>(EMPTY_CARD)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function patchCnh(p: Partial<CnhValues>) {
    setCnh((prev) => ({ ...prev, ...p }))
  }

  async function handleConcluir() {
    setError('')
    const cnhResult = validarCnh(cnh)
    if (!cnhResult.ok) {
      setError(cnhResult.error)
      return
    }
    const cardErr = validarCartao(card)
    if (cardErr) {
      setError(cardErr)
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
      await criarCartao({
        nome: card.nome,
        cpf: card.cpf.replace(/\D/g, ''),
        numero: card.numero.replace(/\s/g, ''),
        validade: card.validade,
      })
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
          Preencha os dados da sua carteira de motorista e do cartão para finalizar.
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
                mask="000"
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleConcluir} disabled={submitting}>
          {submitting ? 'Concluindo...' : 'Concluir cadastro'}
        </Button>
      </div>
    </div>
  )
}
