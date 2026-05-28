'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getMotoById } from '@/services/motos.service'
import { getSeguros } from '@/services/seguros.service'
import { getAcessorios } from '@/services/acessorios.service'
import { getLavagens } from '@/services/lavagens.service'
import { getLocais } from '@/services/locais.service'
import { getToken } from '@/lib/auth'
import { BookingPageClient } from './booking-page-client'
import type { Moto, Seguro, Acessorio, Local, LavagemServico } from '@/lib/types'

interface BookingData {
  moto: Moto
  seguros: Seguro[]
  acessorios: Acessorio[]
  lavagens: LavagemServico[]
  locais: Local[]
}

interface BookingLoaderProps {
  initialStep: number
}

export function BookingLoader({ initialStep }: BookingLoaderProps) {
  const router = useRouter()
  const [data, setData] = useState<BookingData | null>(null)
  const [resolvedStep, setResolvedStep] = useState(initialStep)

  useEffect(() => {
    const motoId = sessionStorage.getItem('booking-moto-id')
    if (!motoId) {
      router.push('/motos')
      return
    }

    const saved = sessionStorage.getItem(`booking-state-${motoId}`)
    let maxCompleted = 0
    try {
      const state = saved ? JSON.parse(saved) : {}
      const completedSteps: number[] = state.completedSteps ?? []
      maxCompleted = completedSteps.length > 0 ? Math.max(...completedSteps) : 0
    } catch {}

    const allowed = Math.min(initialStep, maxCompleted + 1)

    if (allowed >= 5 && !getToken()) {
      router.push(`/login?redirect=${encodeURIComponent('/reservar/passo-5')}`)
      return
    }

    if (allowed !== initialStep) {
      history.replaceState(null, '', `/reservar/passo-${allowed}`)
    }
    setResolvedStep(allowed)

    Promise.all([getMotoById(motoId), getSeguros(), getAcessorios(), getLavagens(), getLocais()])
      .then(([moto, seguros, acessorios, lavagens, locais]) =>
        setData({ moto, seguros, acessorios, lavagens, locais }))
      .catch(() => router.push('/motos'))
  }, [])

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <BookingPageClient
      moto={data.moto}
      seguros={data.seguros}
      acessorios={data.acessorios}
      lavagens={data.lavagens}
      locais={data.locais}
      initialStep={resolvedStep}
    />
  )
}
