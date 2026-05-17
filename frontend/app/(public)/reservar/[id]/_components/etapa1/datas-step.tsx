'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatasStepProps {
  pickupDate?: Date
  returnDate?: Date
  onPickupChange: (d?: Date) => void
  onReturnChange: (d?: Date) => void
  days: number
}

export function DatasStep({
  pickupDate,
  returnDate,
  onPickupChange,
  onReturnChange,
  days,
}: DatasStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Selecione as Datas</h2>
        <p className="mt-1 text-muted-foreground">
          Escolha quando deseja retirar e devolver a moto
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Data de Retirada</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !pickupDate && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {pickupDate ? format(pickupDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione a data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={pickupDate} onSelect={onPickupChange} disabled={(date) => date < new Date()} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Data de Devolução</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !returnDate && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {returnDate ? format(returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione a data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={returnDate} onSelect={onReturnChange} disabled={(date) => date < (pickupDate || new Date())} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {days > 0 && (
        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">Duração do aluguel</p>
          <p className="text-2xl font-bold text-foreground">{days} {days === 1 ? 'dia' : 'dias'}</p>
        </div>
      )}
    </div>
  )
}
