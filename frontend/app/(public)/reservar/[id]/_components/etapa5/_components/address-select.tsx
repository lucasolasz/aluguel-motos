'use client'

import { Loader2, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EnderecoCobranca } from '@/lib/types'

interface AddressSelectProps {
  addresses: EnderecoCobranca[]
  selectedAddressId: string
  onSelectedAddressIdChange: (id: string) => void
  onGoToAddressForm: () => void
  onContinue: () => void
  associating: boolean
}

export function AddressSelect({
  addresses,
  selectedAddressId,
  onSelectedAddressIdChange,
  onGoToAddressForm,
  onContinue,
  associating,
}: AddressSelectProps) {
  return (
    <div className="border-t border-border pt-6">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">Endereço de Cobrança</h3>
      </div>
      {addresses.length > 0 ? (
        <>
          <Select value={selectedAddressId} onValueChange={onSelectedAddressIdChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um endereço" />
            </SelectTrigger>
            <SelectContent>
              {addresses.map((addr) => (
                <SelectItem key={addr.id} value={addr.id}>
                  {(addr.logradouro + (addr.numero ? `, ${addr.numero}` : '') + ' — ' + addr.cidade + '/' + addr.estado).toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="gap-2" onClick={onGoToAddressForm}>
              <Plus className="h-4 w-4" />
              Cadastrar novo endereço
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedAddressId || associating}
              onClick={onContinue}
            >
              {associating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
              ) : 'Continuar'}
            </Button>
          </div>
        </>
      ) : (
        <Button className="w-full gap-2" onClick={onGoToAddressForm}>
          <Plus className="h-4 w-4" />
          Cadastrar novo endereço
        </Button>
      )}
    </div>
  )
}
