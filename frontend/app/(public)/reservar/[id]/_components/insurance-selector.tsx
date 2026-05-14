'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Shield } from 'lucide-react'
import type { Seguro } from '@/lib/types'
import { formatCurrency } from '@/lib/data'
import { cn } from '@/lib/utils'

interface InsuranceSelectorProps {
  seguros: Seguro[]
  selectedId: string
  onSelect: (seguroId: string) => void
}

export function InsuranceSelector({
  seguros,
  selectedId,
  onSelect,
}: InsuranceSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Escolha seu Seguro</h2>
        <p className="mt-1 text-muted-foreground">
          Selecione a proteção ideal para sua viagem
        </p>
      </div>

      <RadioGroup value={selectedId} onValueChange={onSelect}>
        <div className="grid gap-4">
          {seguros.map((seguro) => (
            <Label
              key={seguro.id}
              htmlFor={seguro.id}
              className="cursor-pointer"
            >
              <Card
                className={cn(
                  'transition-all hover:border-primary/50',
                  selectedId === seguro.id && 'border-primary ring-1 ring-primary'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={seguro.id} id={seguro.id} />
                      <div>
                        <CardTitle className="text-base">{seguro.nome}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {seguro.descricao}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {seguro.basico ? (
                        <Badge variant="secondary">Incluso</Badge>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(seguro.precoPorDia)}
                          </p>
                          <p className="text-xs text-muted-foreground">/dia</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {seguro.coberturas.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm">
                        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Label>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
