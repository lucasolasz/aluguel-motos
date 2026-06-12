'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, Check, Cog, Fuel, Gauge, Weight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/data'
import type { Moto } from '@/lib/types'

interface MotoCardProps {
  moto: Moto
  hideAction?: boolean
  diariaEfetiva?: number
  hidePrice?: boolean
}

export function MotoCard({ moto, hideAction = false, diariaEfetiva, hidePrice = false }: MotoCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  const fotoUrl =
    moto.fotos.find((f) => f.principal)?.url ||
    moto.fotos[0]?.url ||
    '/images/placeholder-moto.jpg'

  const handleReservar = () => {
    if (!sessionStorage.getItem('search-period')) {
      router.push('/?search=open')
      return
    }
    sessionStorage.setItem('booking-moto-id', moto.id)
    router.push('/reservar/passo-1')
  }

  const actionButton = (
    <Button size="sm" disabled={!moto.disponivel} onClick={handleReservar}>
      Reservar Agora
    </Button>
  )

  const specs = [
    { icon: Gauge, label: 'Motor', value: moto.motor },
    { icon: Cog, label: 'Potência', value: moto.potencia },
    { icon: ArrowUpDown, label: 'Câmbio', value: moto.transmissao },
    { icon: Fuel, label: 'Tanque', value: moto.capacidadeTanque },
    { icon: Weight, label: 'Peso', value: moto.peso },
  ]

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={fotoUrl}
            alt={moto.nome}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute left-3 top-3" variant="secondary">
            {moto.categoria.nome}
          </Badge>
          {!moto.disponivel && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <span className="text-sm font-medium text-muted-foreground">Indisponível</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-foreground">{moto.nome}</h3>
            <p className="text-sm text-muted-foreground">
              {moto.marca} {moto.ano}
            </p>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">{moto.motor}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{moto.potencia}</span>
          </div>
          <div className="flex items-center justify-between">
            {!hidePrice && (
              <div>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(diariaEfetiva ?? moto.precoPorDia)}
                </p>
                <p className="text-xs text-muted-foreground">por dia</p>
              </div>
            )}
            {!hideAction && actionButton}
          </div>
          {!hideAction && (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="mt-3 w-full text-center text-xs underline underline-offset-2 hover:text-foreground hover:underline"
            >
              Mostrar detalhes
            </button>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{moto.nome}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {moto.marca} {moto.ano}
            </p>
          </DialogHeader>

          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            <Image
              src={fotoUrl}
              alt={moto.nome}
              fill
              sizes="512px"
              className="object-contain"
            />
            <Badge className="absolute left-3 top-3" variant="secondary">
              {moto.categoria.nome}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Especificações</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <spec.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{spec.label}</p>
                      <p className="text-sm font-medium text-foreground">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {moto.itens.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Recursos</p>
                <div className="grid grid-cols-2 gap-2">
                  {moto.itens.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-green-500" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              {!hidePrice && (
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(diariaEfetiva ?? moto.precoPorDia)}
                  </p>
                  <p className="text-xs text-muted-foreground">por dia</p>
                </div>
              )}
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Caução</p>
                <p className="font-semibold text-foreground">{formatCurrency(moto.caucao)}</p>
              </div>
            </div>

            {actionButton}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
