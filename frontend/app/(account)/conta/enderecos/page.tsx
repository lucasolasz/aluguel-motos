'use client'

import { useEffect, useState } from 'react'
import { MapPin, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddressFields, type AddressData, EMPTY_ADDRESS } from '@/components/address-fields'
import { getMeuEndereco, criarMeuEndereco, atualizarMeuEndereco } from '@/services/endereco.service'
import { validarEnderecoCompleto } from '@/lib/validations'
import type { Endereco } from '@/lib/types'

export default function EnderecosPage() {
  const [endereco, setEndereco] = useState<Endereco | null>(null)
  const [form, setForm] = useState<AddressData>(EMPTY_ADDRESS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getMeuEndereco()
      .then((data) => {
        if (data) {
          setEndereco(data)
          setForm({
            cep: data.cep ?? '',
            logradouro: data.logradouro ?? '',
            numero: data.numero ?? '',
            semNumero: data.semNumero ?? false,
            complemento: data.complemento ?? '',
            estado: data.estado ?? '',
            cidade: data.cidade ?? '',
            bairro: data.bairro ?? '',
          })
        }
      })
      .catch(() => setMessage('Erro ao carregar endereço.'))
      .finally(() => setLoading(false))
  }, [])

  function handlePatch(patch: Partial<AddressData>) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  async function handleSave() {
    const err = validarEnderecoCompleto(form)
    if (err) {
      setMessage(err)
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const payload = {
        cep: form.cep.replace(/\D/g, ''),
        logradouro: form.logradouro,
        numero: form.numero,
        semNumero: form.semNumero,
        complemento: form.complemento,
        estado: form.estado,
        cidade: form.cidade,
        bairro: form.bairro,
      }
      if (endereco) {
        const updated = await atualizarMeuEndereco(endereco.id, payload)
        setEndereco(updated)
        setForm({
          cep: updated.cep ?? '',
          logradouro: updated.logradouro ?? '',
          numero: updated.numero ?? '',
          semNumero: updated.semNumero ?? false,
          complemento: updated.complemento ?? '',
          estado: updated.estado ?? '',
          cidade: updated.cidade ?? '',
          bairro: updated.bairro ?? '',
        })
        setMessage('Endereço atualizado com sucesso!')
      } else {
        const created = await criarMeuEndereco(payload)
        setEndereco(created)
        setForm({
          cep: created.cep ?? '',
          logradouro: created.logradouro ?? '',
          numero: created.numero ?? '',
          semNumero: created.semNumero ?? false,
          complemento: created.complemento ?? '',
          estado: created.estado ?? '',
          cidade: created.cidade ?? '',
          bairro: created.bairro ?? '',
        })
        setMessage('Endereço cadastrado com sucesso!')
      }
      setEditing(false)
    } catch {
      setMessage('Erro ao salvar endereço.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  const hasAddress = !!endereco
  const showForm = !hasAddress || editing

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Endereço</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie seu endereço residencial
          </p>
        </div>
        {hasAddress && !editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      {hasAddress && !editing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              Endereço Cadastrado
            </CardTitle>
            <CardDescription>
              {endereco.logradouro}{endereco.numero ? `, ${endereco.numero}` : ''}{endereco.semNumero ? ' (S/N)' : ''}
              {endereco.complemento ? ` - ${endereco.complemento}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">CEP</dt>
                <dd>{endereco.cep}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Bairro</dt>
                <dd>{endereco.bairro}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Cidade</dt>
                <dd>{endereco.cidade}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                <dd>{endereco.estado}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              {editing ? 'Editar Endereço' : 'Cadastrar Endereço'}
            </CardTitle>
            <CardDescription>
              {editing ? 'Atualize os dados do seu endereço' : 'Preencha seu endereço residencial'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddressFields value={form} onChange={handlePatch} />
            {message && (
              <p className={`text-sm ${message.includes('Erro') ? 'text-destructive' : 'text-green-600'}`}>
                {message}
              </p>
            )}
            <div className="flex gap-3">
              {editing && (
                <Button variant="outline" onClick={() => {
                  setEditing(false)
                  setMessage('')
                }}>
                  Cancelar
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Cadastrar Endereço'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}