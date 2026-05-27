'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlidersHorizontal, Grid, List, ChevronDown, ChevronUp, CalendarSearch } from 'lucide-react'
import { MotoCard } from '@/components/moto-card'
import { SearchForm } from '@/app/(public)/_components/search-form'
import type { Moto, Categoria, Local } from '@/lib/types'

interface MotosListProps {
  motos: Moto[]
  categorias: Categoria[]
  locais: Local[]
  searchParams?: Record<string, string>
}

const FORWARDED_KEYS = [
  'local_retirada',
  'pickup',
  'hora_retirada',
  'local_devolucao',
  'return',
  'hora_devolucao',
] as const

export function MotosList({ motos, categorias, locais, searchParams = {} }: MotosListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('price-asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const hasPeriodo = !!searchParams.pickup && !!searchParams.return
  const [showSearch, setShowSearch] = useState(!hasPeriodo)
  const [highlightSearch, setHighlightSearch] = useState(false)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  const openAndScrollSearch = useCallback(() => {
    setShowSearch(true)
    setHighlightSearch(true)
    setTimeout(() => {
      searchWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    setTimeout(() => setHighlightSearch(false), 2000)
  }, [])

  const reservationQs = useMemo(() => {
    const qs = new URLSearchParams()
    for (const k of FORWARDED_KEYS) {
      if (searchParams[k]) qs.set(k, searchParams[k]!)
    }
    return qs.toString()
  }, [searchParams])

  const periodoLabel = useMemo(() => {
    if (!hasPeriodo) return ''
    try {
      const fmt = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      const ini = fmt.format(new Date(searchParams.pickup!))
      const fim = fmt.format(new Date(searchParams.return!))
      return `${ini} → ${fim}`
    } catch {
      return ''
    }
  }, [hasPeriodo, searchParams])

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

  const searchFormInitialValues = useMemo(
    () => ({
      localRetiradaId: searchParams.local_retirada,
      pickup: searchParams.pickup,
      horaRetirada: searchParams.hora_retirada,
      localDevolucaoId: searchParams.local_devolucao,
      returnDate: searchParams.return,
      horaDevolucao: searchParams.hora_devolucao,
    }),
    [searchParams],
  )

  return (
    <>
      <div
        ref={searchWrapperRef}
        className={cn(
          'mb-6 scroll-mt-20 rounded-lg border border-border bg-card shadow-sm transition-all duration-300',
          highlightSearch && 'ring-4 ring-primary/50 ring-offset-2 ring-offset-background',
        )}
      >
        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm"
        >
          <div className="flex items-center gap-2">
            <CalendarSearch className="h-4 w-4 text-primary" />
            {hasPeriodo && periodoLabel ? (
              <span>
                <span className="text-muted-foreground">Período: </span>
                <span className="font-medium text-foreground">{periodoLabel}</span>
              </span>
            ) : (
              <span className="font-medium text-foreground">Selecionar período</span>
            )}
          </div>
          {showSearch ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {showSearch && (
          <div className="border-t border-border px-4 pb-4 pt-4">
            <SearchForm
              locais={locais}
              variant="compact"
              initialValues={searchFormInitialValues}
            />
          </div>
        )}
      </div>

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
              reservationQs={reservationQs}
              onNoperiodClick={reservationQs ? undefined : openAndScrollSearch}
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
