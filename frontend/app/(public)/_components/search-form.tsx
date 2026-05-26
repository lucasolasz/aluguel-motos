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
import { gerarHorariosReserva } from '@/lib/data'
import { Categoria, Local } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, MapPin, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

interface SearchFormProps {
  categories?: Categoria[]
  locais: Local[]
  variant?: 'default' | 'compact'
  className?: string
}

export function SearchForm({ locais, variant = 'default', className }: SearchFormProps) {
  const router = useRouter()
  const horarios = useMemo(() => gerarHorariosReserva(), [])

  const [localRetiradaId, setLocalRetiradaId] = useState<string>('')
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined)
  const [horaRetirada, setHoraRetirada] = useState<string>('')
  const [localDevolucaoId, setLocalDevolucaoId] = useState<string>('')
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined)
  const [horaDevolucao, setHoraDevolucao] = useState<string>('')
  const [pickupOpen, setPickupOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  const showDevolucao = !!pickupDate

  const canSearch =
    !!localRetiradaId &&
    !!pickupDate &&
    !!horaRetirada &&
    !!localDevolucaoId &&
    !!returnDate &&
    !!horaDevolucao

  const searchHref = useMemo(() => {
    const params = new URLSearchParams()
    if (localRetiradaId) params.set('local_retirada', localRetiradaId)
    if (pickupDate) params.set('pickup', pickupDate.toISOString())
    if (horaRetirada) params.set('hora_retirada', horaRetirada)
    if (localDevolucaoId) params.set('local_devolucao', localDevolucaoId)
    if (returnDate) params.set('return', returnDate.toISOString())
    if (horaDevolucao) params.set('hora_devolucao', horaDevolucao)
    const qs = params.toString()
    return qs ? `/motos?${qs}` : '/motos'
  }, [localRetiradaId, pickupDate, horaRetirada, localDevolucaoId, returnDate, horaDevolucao])

  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        !isCompact && 'rounded-2xl border border-border bg-card p-6 shadow-lg',
        className
      )}
    >
      <div className="space-y-4">
        {/* RETIRADA */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
            Retirada
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Local</label>
              <Select value={localRetiradaId} onValueChange={setLocalRetiradaId}>
                <SelectTrigger>
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Selecione o local" />
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
              <label className="text-xs font-medium text-muted-foreground">Data</label>
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
                    {pickupDate
                      ? format(pickupDate, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={(date) => {
                      setPickupDate(date)
                      setPickupOpen(false)
                      if (date && returnDate && returnDate < date) {
                        setReturnDate(undefined)
                      }
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Horário</label>
              <Select value={horaRetirada} onValueChange={setHoraRetirada}>
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

        {/* DEVOLUÇÃO */}
        {showDevolucao && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
              Devolução
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Local</label>
                <Select value={localDevolucaoId} onValueChange={setLocalDevolucaoId}>
                  <SelectTrigger>
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Selecione o local" />
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
                <label className="text-xs font-medium text-muted-foreground">Data</label>
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
                      {returnDate
                        ? format(returnDate, 'dd/MM/yyyy', { locale: ptBR })
                        : 'Selecione'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={(date) => {
                        setReturnDate(date)
                        setReturnOpen(false)
                      }}
                      disabled={(date) => date < (pickupDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Horário</label>
                <Select value={horaDevolucao} onValueChange={setHoraDevolucao}>
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
        )}

        <div className="flex justify-end pt-2">
          <Button
            onClick={() => router.push(searchHref)}
            disabled={!canSearch}
            size={isCompact ? 'default' : 'lg'}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Buscar Motos
          </Button>
        </div>
      </div>
    </div>
  )
}
