'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, MapPin } from 'lucide-react'
import { useMemo } from 'react'
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
import { gerarHorariosReserva } from '@/lib/data'
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
}: DatasStepProps) {
  const horarios = useMemo(() => gerarHorariosReserva(), [])

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
          <div className="space-y-1.5">
            <Label className="text-xs">Local</Label>
            <Select value={localRetiradaId} onValueChange={onLocalRetiradaChange}>
              <SelectTrigger>
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
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Horário</Label>
            <Select value={horaRetirada} onValueChange={onHoraRetiradaChange}>
              <SelectTrigger>
                <SelectValue placeholder="--:--" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64">
                {horarios.map((h) => (
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
          <div className="space-y-1.5">
            <Label className="text-xs">Local</Label>
            <Select value={localDevolucaoId} onValueChange={onLocalDevolucaoChange}>
              <SelectTrigger>
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
                  disabled={(date) => date < (pickupDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Horário</Label>
            <Select value={horaDevolucao} onValueChange={onHoraDevolucaoChange}>
              <SelectTrigger>
                <SelectValue placeholder="--:--" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64">
                {horarios.map((h) => (
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
