'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CustomerData } from '../use-step5'

interface CustomerDataFieldsProps {
  data: CustomerData
}

export function CustomerDataFields({ data }: CustomerDataFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input id="fullName" value={data.fullName} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={[data.ddi, data.ddd, data.numero].filter(Boolean).join(' ')}
          disabled
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input id="cpf" value={data.cpf} disabled />
      </div>
    </div>
  )
}
