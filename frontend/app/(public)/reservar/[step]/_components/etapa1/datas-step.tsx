'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, MapPin, Pencil } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  horariosDevolucaoValidos,
  horariosRetiradaValidos,
  startOfToday,
} from '@/lib/data'
import type { Local } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DatasStepProps {
  locais: Local[]
  pickupDate?: Date
  returnDate?: Date
  onPickupChange: (d?: Date) => void
  onReturnChange: (d?: Date) => void
  horaRetirada: string
  horaDevolucao: string
  onHoraRetiradaChange: (h: string) => void
  onHoraDevolucaoChange: (h: string) => void
  localRetiradaId: string
  localDevolucaoId: string
  onLocalRetiradaChange: (id: string) => void
  onLocalDevolucaoChange: (id: string) => void
  days: number
  readOnly?: boolean
  onEdit?: () => void
}

export function DatasStep({
  locais,
  pickupDate,
  returnDate,
  onPickupChange,
  onReturnChange,
  horaRetirada,
  horaDevolucao,
  onHoraRetiradaChange,
  onHoraDevolucaoChange,
  localRetiradaId,
  localDevolucaoId,
  onLocalRetiradaChange,
  onLocalDevolucaoChange,
  days,
  readOnly = false,
  onEdit,
}: DatasStepProps) {
  const horariosRetirada = useMemo(
    () => horariosRetiradaValidos(pickupDate),
    [pickupDate],
  )
  const horariosDevolucao = useMemo(
    () => horariosDevolucaoValidos(pickupDate, horaRetirada, returnDate),
    [pickupDate, horaRetirada, returnDate],
  )

  useEffect(() => {
    if (horaRetirada && !horariosRetirada.includes(horaRetirada)) {
      onHoraRetiradaChange('')
    }
  }, [horariosRetirada, horaRetirada, onHoraRetiradaChange])

  useEffect(() => {
    if (horaDevolucao && !horariosDevolucao.includes(horaDevolucao)) {
      onHoraDevolucaoChange('')
    }
  }, [horariosDevolucao, horaDevolucao, onHoraDevolucaoChange])

  if (readOnly) {
    const localRetirada = locais.find((l) => l.id === localRetiradaId)
    const localDevolucao = locais.find((l) => l.id === localDevolucaoId)
    const dataRetiradaLabel = pickupDate
      ? format(pickupDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : ''
    const dataDevolucaoLabel = returnDate
      ? format(returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : ''

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Local, datas e horários</h2>
            <p className="mt-1 text-muted-foreground">Dados informados na busca</p>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Retirada
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {localRetirada
                    ? `${localRetirada.nome} — ${localRetirada.cidade}/${localRetirada.estado}`
                    : '—'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {dataRetiradaLabel} às {horaRetirada}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Devolução
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {localDevolucao
                    ? `${localDevolucao.nome} — ${localDevolucao.cidade}/${localDevolucao.estado}`
                    : '—'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {dataDevolucaoLabel} às {horaDevolucao}
                </span>
              </div>
            </div>
          </div>
        </div>

        {days > 0 && (
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Duração do aluguel</p>
            <p className="text-2xl font-bold text-foreground">
              {days} {days === 1 ? 'dia' : 'dias'}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Local, datas e horários</h2>
        <p className="mt-1 text-muted-foreground">
          Defina onde e quando retirar e devolver a moto
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Retirada
        </h3>
<div className="grid gap-4 md:grid-cols-3">
           <div className="min-w-0 space-y-1.5">
             <Label className="text-xs">Local</Label>
             <Select value={localRetiradaId} onValueChange={onLocalRetiradaChange}>
              <SelectTrigger className="w-full">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent position="popper">
                {locais.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.nome} — {l.cidade}/{l.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !pickupDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {pickupDate
                    ? format(pickupDate, "dd 'de' MMM", { locale: ptBR })
                    : 'Selecione'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={pickupDate}
                  onSelect={onPickupChange}
                  disabled={(date) => date < startOfToday()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Horário</Label>
            <Select value={horaRetirada} onValueChange={onHoraRetiradaChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="--:--" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64">
                {horariosRetirada.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Devolução
        </h3>
<div className="grid gap-4 md:grid-cols-3">
           <div className="min-w-0 space-y-1.5">
             <Label className="text-xs">Local</Label>
             <Select value={localDevolucaoId} onValueChange={onLocalDevolucaoChange}>
              <SelectTrigger className="w-full">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent position="popper">
                {locais.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.nome} — {l.cidade}/{l.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !returnDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate
                    ? format(returnDate, "dd 'de' MMM", { locale: ptBR })
                    : 'Selecione'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={onReturnChange}
                  disabled={(date) => date < (pickupDate || startOfToday())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Horário</Label>
            <Select value={horaDevolucao} onValueChange={onHoraDevolucaoChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="--:--" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64">
                {horariosDevolucao.length === 0 && (
                  <div className="px-2 py-3 text-xs text-muted-foreground">
                    Sem horário disponível
                  </div>
                )}
                {horariosDevolucao.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {days > 0 && (
        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">Duração do aluguel</p>
          <p className="text-2xl font-bold text-foreground">
            {days} {days === 1 ? 'dia' : 'dias'}
          </p>
        </div>
      )}
    </div>
  )
}
