'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Categoria } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

interface SearchFormProps {
  categories: Categoria[]
  variant?: 'default' | 'compact'
  className?: string
}

export function SearchForm({ categories, variant = 'default', className }: SearchFormProps) {
  const [pickupDate, setPickupDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [category, setCategory] = useState<string>('')
  const [pickupOpen, setPickupOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  const searchHref = useMemo(() => {
    const params = new URLSearchParams()
    if (pickupDate) params.set('pickup', pickupDate.toISOString())
    if (returnDate) params.set('return', returnDate.toISOString())
    if (category && category !== 'all') params.set('category', category)
    const qs = params.toString()
    return qs ? `/motos?${qs}` : '/motos'
  }, [pickupDate, returnDate, category])

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end', className)}>
        <div className="flex-1">
          <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !pickupDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {pickupDate ? format(pickupDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Retirada'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={pickupDate}
                onSelect={(date) => { setPickupDate(date); setPickupOpen(false) }}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1">
          <Popover open={returnOpen} onOpenChange={setReturnOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !returnDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {returnDate ? format(returnDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Devolução'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={(date) => { setReturnDate(date); setReturnOpen(false) }}
                disabled={(date) => date < (pickupDate || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button asChild className="gap-2">
          <Link href={searchHref}>
            <Search className="h-4 w-4" />
            Buscar
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6 shadow-lg', className)}>
      <div className="grid gap-6 md:grid-cols-4">
        {/* Data de Retirada */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Data de Retirada
          </label>
          <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !pickupDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {pickupDate ? format(pickupDate, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={pickupDate}
                onSelect={(date) => { setPickupDate(date); setPickupOpen(false) }}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data de Devolução */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Data de Devolução
          </label>
          <Popover open={returnOpen} onOpenChange={setReturnOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !returnDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {returnDate ? format(returnDate, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={(date) => { setReturnDate(date); setReturnOpen(false) }}
                disabled={(date) => date < (pickupDate || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Categoria
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botão de Busca */}
        <div className="flex items-end">
          <Button asChild size="lg" className="w-full gap-2">
            <Link href={searchHref}>
              <Search className="h-5 w-5" />
              Buscar Motos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
