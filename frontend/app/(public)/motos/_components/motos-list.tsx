'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlidersHorizontal, Grid, List, CalendarDays } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MotoCard } from '@/components/moto-card'
import type { Moto, Categoria } from '@/lib/types'

export interface SearchPeriod {
  pickup: string
  return: string
  hora_retirada: string
  hora_devolucao: string
  local_retirada: string
  local_devolucao: string
}

interface MotosListProps {
  motos: Moto[]
  categorias: Categoria[]
  period: SearchPeriod | null
}

export function MotosList({ motos, categorias, period }: MotosListProps) {
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('price-asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const periodoLabel = useMemo(() => {
    if (!period?.pickup || !period?.return) return null
    try {
      const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      const ini = fmt.format(new Date(period.pickup))
      const fim = fmt.format(new Date(period.return))
      const horaIni = period.hora_retirada ? ` às ${period.hora_retirada}` : ''
      const horaFim = period.hora_devolucao ? ` às ${period.hora_devolucao}` : ''
      return `${ini}${horaIni} → ${fim}${horaFim}`
    } catch {
      return null
    }
  }, [period])

  const filteredMotos = useMemo(() => {
    let filtered = [...motos]

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((m) => m.categoria.id === selectedCategory)
    }

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.precoPorDia - b.precoPorDia)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.precoPorDia - a.precoPorDia)
        break
      case 'name':
        filtered.sort((a, b) => a.nome.localeCompare(b.nome))
        break
      case 'year':
        filtered.sort((a, b) => b.ano - a.ano)
        break
    }

    return filtered
  }, [motos, selectedCategory, sortBy])

  return (
    <>
      {periodoLabel && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-muted-foreground">Período selecionado:</span>
          <span className="font-medium text-foreground">{periodoLabel}</span>
          <button
            className="ml-auto shrink-0 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            onClick={() => {
              sessionStorage.removeItem('search-period')
              router.push('/?search=open')
            }}
          >
            Limpar pesquisa
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="price-asc">Menor preço</SelectItem>
              <SelectItem value="price-desc">Maior preço</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
              <SelectItem value="year">Mais recentes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredMotos.length}{' '}
            {filteredMotos.length === 1 ? 'moto encontrada' : 'motos encontradas'}
          </p>
          <div className="ml-4 flex items-center gap-1 rounded-lg border border-border p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Visualização em grade</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Visualização em lista</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid/List */}
      {filteredMotos.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-4'
          }
        >
          {filteredMotos.map((moto) => (
            <MotoCard
              key={moto.id}
              moto={moto}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Nenhuma moto encontrada com os filtros selecionados.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSelectedCategory('all')
              setSortBy('price-asc')
            }}
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </>
  )
}
