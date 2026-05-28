'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  formatCurrency,
  horariosDevolucaoValidos,
  horariosRetiradaValidos,
  startOfToday,
} from '@/lib/data'
import { cn } from '@/lib/utils'
import type { Local, Moto } from '@/lib/types'

interface BookingWidgetProps {
  moto: Moto
  locais: Local[]
  initialParams?: {
    localRetirada?: string
    pickup?: string
    horaRetirada?: string
    localDevolucao?: string
    returnDate?: string
    horaDevolucao?: string
  }
}

function calculateDays(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function BookingWidget({ moto, locais, initialParams = {} }: BookingWidgetProps) {
  const router = useRouter()

  const [localRetiradaId, setLocalRetiradaId] = useState(initialParams.localRetirada ?? '')
  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    initialParams.pickup ? new Date(initialParams.pickup) : undefined,
  )
  const [horaRetirada, setHoraRetirada] = useState(initialParams.horaRetirada ?? '')
  const [localDevolucaoId, setLocalDevolucaoId] = useState(initialParams.localDevolucao ?? '')
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    initialParams.returnDate ? new Date(initialParams.returnDate) : undefined,
  )
  const [horaDevolucao, setHoraDevolucao] = useState(initialParams.horaDevolucao ?? '')

  const horariosRetirada = useMemo(() => horariosRetiradaValidos(pickupDate), [pickupDate])
  const horariosDevolucao = useMemo(
    () => horariosDevolucaoValidos(pickupDate, horaRetirada, returnDate),
    [pickupDate, horaRetirada, returnDate],
  )

  useEffect(() => {
    if (horaRetirada && !horariosRetirada.includes(horaRetirada)) setHoraRetirada('')
  }, [horariosRetirada, horaRetirada])

  useEffect(() => {
    if (horaDevolucao && !horariosDevolucao.includes(horaDevolucao)) setHoraDevolucao('')
  }, [horariosDevolucao, horaDevolucao])

  const days = pickupDate && returnDate ? calculateDays(pickupDate, returnDate) : 0
  const isComplete =
    !!localRetiradaId &&
    !!pickupDate &&
    !!horaRetirada &&
    !!localDevolucaoId &&
    !!returnDate &&
    !!horaDevolucao &&
    days > 0

  function handleReservar() {
    if (!isComplete) return
    const qs = new URLSearchParams()
    qs.set('local_retirada', localRetiradaId)
    qs.set('pickup', pickupDate!.toISOString())
    qs.set('hora_retirada', horaRetirada)
    qs.set('local_devolucao', localDevolucaoId)
    qs.set('return', returnDate!.toISOString())
    qs.set('hora_devolucao', horaDevolucao)
    router.push(`/reservar/${moto.id}?${qs.toString()}`)
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(moto.precoPorDia)}</p>
          <p className="text-sm text-muted-foreground">por dia</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Caução</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(moto.caucao)}</p>
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="min-w-0 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Retirada
        </p>
        <Select value={localRetiradaId} onValueChange={setLocalRetiradaId}>
          <SelectTrigger className="w-full">
            <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Local de retirada" />
          </SelectTrigger>
          <SelectContent position="popper">
            {locais.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.nome} — {l.cidade}/{l.estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !pickupDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {pickupDate ? format(pickupDate, "dd 'de' MMM", { locale: ptBR }) : 'Data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={pickupDate}
                onSelect={setPickupDate}
                disabled={(date) => date < startOfToday()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={horaRetirada} onValueChange={setHoraRetirada}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Hora" />
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

      <div className="min-w-0 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Devolução
        </p>
        <Select value={localDevolucaoId} onValueChange={setLocalDevolucaoId}>
          <SelectTrigger className="w-full">
            <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Local de devolução" />
          </SelectTrigger>
          <SelectContent position="popper">
            {locais.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.nome} — {l.cidade}/{l.estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !returnDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {returnDate ? format(returnDate, "dd 'de' MMM", { locale: ptBR }) : 'Data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={setReturnDate}
                disabled={(date) => date < (pickupDate || startOfToday())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={horaDevolucao} onValueChange={setHoraDevolucao}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Hora" />
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

      {days > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {days} {days === 1 ? 'dia' : 'dias'}
          </p>
          <p className="font-semibold text-foreground">
            {formatCurrency(days * moto.precoPorDia)}
          </p>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleReservar}
        disabled={!isComplete || !moto.disponivel}
      >
        {!moto.disponivel ? 'Indisponível' : isComplete ? 'Reservar' : 'Selecione o período'}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Seguro básico incluso no valor da diária
      </p>
    </div>
  )
}
