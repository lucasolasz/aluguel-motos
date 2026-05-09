import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/data'
import type { Moto } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

interface MotoCardProps {
  moto: Moto
}

export function MotoCard({ moto }: MotoCardProps) {
  const fotoUrl = moto.fotos.find(f => f.principal)?.url || moto.fotos[0]?.url || '/images/placeholder-moto.jpg'

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={fotoUrl}
          alt={moto.nome}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3" variant="secondary">
          {moto.categoria.nome}
        </Badge>
        {!moto.disponivel && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-sm font-medium text-muted-foreground">
              Indisponível
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">{moto.nome}</h3>
            <p className="text-sm text-muted-foreground">
              {moto.marca} {moto.ano}
            </p>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">
            {moto.motor}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {moto.potencia}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(moto.precoPorDia)}
            </p>
            <p className="text-xs text-muted-foreground">por dia</p>
          </div>
          <Button asChild size="sm" disabled={!moto.disponivel}>
            <Link href={`/motos/${moto.id}`}>
              Reservar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
