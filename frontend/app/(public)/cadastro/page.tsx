'use client'

import { BookingStepper } from '@/app/(public)/reservar/[step]/_components/booking-stepper'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useState } from 'react'
import { EMPTY_DADOS, type DadosPessoais } from './_components/dados-form'
import { Step1Dados } from './_components/step1-dados'
import { Step2Confirmacao } from './_components/step2-confirmacao'
import { Step3Conclusao } from './_components/step3-conclusao'

const STEPS = [
  { id: 1, name: 'Dados Pessoais' },
  { id: 2, name: 'Confirmação do Cadastro' },
  { id: 3, name: 'Conclusão do Cadastro' },
]

export default function CadastroPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [dados, setDados] = useState<DadosPessoais>(EMPTY_DADOS)
  const [error, setError] = useState('')

  function patch(p: Partial<DadosPessoais>) {
    setDados((prev) => ({ ...prev, ...p }))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
        <p className="mt-1 text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>

      <div className="mb-8">
        <BookingStepper steps={STEPS} currentStep={currentStep} />
      </div>

      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <Step1Dados
              dados={dados}
              onChange={patch}
              onNext={() => setCurrentStep(2)}
              error={error}
              setError={setError}
            />
          )}
          {currentStep === 2 && (
            <Step2Confirmacao
              dados={dados}
              onBack={() => setCurrentStep(1)}
              onConfirmed={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 3 && <Step3Conclusao dados={dados} />}
        </CardContent>
      </Card>
    </div>
  )
}
