'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check } from 'lucide-react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'

interface CompletionScreenProps {
  reservaId: string
  motoNome: string
  days: number
  pickupDate?: Date
  returnDate?: Date
}

export function CompletionScreen({
  reservaId,
  motoNome,
  days,
  pickupDate,
  returnDate,
}: CompletionScreenProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center py-12 px-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
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
              <p>{motoNome} - {days} {days === 1 ? 'dia' : 'dias'}</p>
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
