'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { MotosList, type SearchPeriod } from './motos-list'
import { mapMotos, type MotoDTO } from '@/lib/mappers'
import { API_URL } from '@/lib/config'
import type { Moto, Categoria } from '@/lib/types'

interface MotosLoaderProps {
  categorias: Categoria[]
}

export function MotosLoader({ categorias }: MotosLoaderProps) {
  const [motos, setMotos] = useState<Moto[]>([])
  const [period, setPeriod] = useState<SearchPeriod | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem('search-period')
    let p: SearchPeriod | null = null
    try {
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed?.savedAt && Date.now() - parsed.savedAt < 15 * 60 * 1000) {
        p = parsed.data
      } else if (raw) {
        sessionStorage.removeItem('search-period')
      }
    } catch {
      p = null
    }
    setPeriod(p)

    const qs = new URLSearchParams()
    if (p?.pickup && p?.return) {
      qs.set('dataRetirada', p.pickup.slice(0, 10))
      qs.set('dataDevolucao', p.return.slice(0, 10))
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : ''

    fetch(`${API_URL}/api/motos${suffix}`)
      .then((r) => {
        if (!r.ok) throw new Error('Erro ao buscar motos')
        return r.json()
      })
      .then((data: MotoDTO[]) => {
        setMotos(mapMotos(data))
        setLoading(false)
      })
      .catch(() => {
        setMotos([])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <MotosList motos={motos} categorias={categorias} period={period} />
}
