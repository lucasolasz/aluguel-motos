'use client'

import { Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MaskedInput } from '../../masked-input'
import type { NewAddressData } from '../use-step5'

interface AddressFormProps {
  data: NewAddressData
  onChange: (updater: (prev: NewAddressData) => NewAddressData) => void
  onCepBlur: (cep: string) => void
  onSubmit: () => void
  onBack: () => void
  cepLoading: boolean
  isValid: boolean
  saving: boolean
}

export function AddressForm({
  data,
  onChange,
  onCepBlur,
  onSubmit,
  onBack,
  cepLoading,
  isValid,
  saving,
}: AddressFormProps) {
  return (
    <div className="border-t border-border pt-6">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">Novo Endereço de Cobrança</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cep">CEP</Label>
          <div className="relative">
            <MaskedInput
              id="cep"
              mask="00000-000"
              value={data.cep}
              onAccept={(val) => onChange((p) => ({ ...p, cep: val }))}
              onBlur={(e) => onCepBlur(e.target.value)}
              placeholder="00000-000"
            />
            {cepLoading && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="logradouro">Endereço</Label>
          <Input
            id="logradouro"
            value={data.logradouro}
            onChange={(e) => onChange((p) => ({ ...p, logradouro: e.target.value.toUpperCase() }))}
            placeholder="RUA, AVENIDA..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            value={data.numero}
            onChange={(e) => onChange((p) => ({ ...p, numero: e.target.value.replace(/\D/g, '') }))}
            placeholder="123"
            disabled={data.semNumero}
          />
        </div>
        <div className="flex items-end space-y-2 pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={data.semNumero}
              onChange={(e) =>
                onChange((p) => ({
                  ...p,
                  semNumero: e.target.checked,
                  numero: e.target.checked ? '' : p.numero,
                }))
              }
            />
            Sem número
          </label>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={data.complemento}
            onChange={(e) => onChange((p) => ({ ...p, complemento: e.target.value.toUpperCase() }))}
            placeholder="APTO, BLOCO... (OPCIONAL)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Input
            id="estado"
            value={data.estado}
            onChange={(e) => onChange((p) => ({ ...p, estado: e.target.value.toUpperCase() }))}
            placeholder="SP"
            maxLength={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={data.cidade}
            onChange={(e) => onChange((p) => ({ ...p, cidade: e.target.value.toUpperCase() }))}
            placeholder="SÃO PAULO"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            value={data.bairro}
            onChange={(e) => onChange((p) => ({ ...p, bairro: e.target.value.toUpperCase() }))}
            placeholder="CENTRO"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button
          className="flex-1"
          onClick={onSubmit}
          disabled={!isValid || saving}
        >
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
          ) : 'Cadastrar Endereço'}
        </Button>
      </div>
    </div>
  )
}
