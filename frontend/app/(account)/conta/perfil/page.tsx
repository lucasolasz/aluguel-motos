'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getMeuPerfil, atualizarPerfil } from '@/services/usuario.service'
import type { UserProfile } from '@/lib/types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({
    nomeCompleto: '',
    telefone: '',
    numeroCnh: '',
    fotoPerfil: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getMeuPerfil()
      .then((p) => {
        setProfile(p)
        setForm({
          nomeCompleto: p.nomeCompleto ?? '',
          telefone: p.telefone ?? '',
          numeroCnh: p.numeroCnh ?? '',
          fotoPerfil: p.fotoPerfil ?? '',
        })
      })
      .catch(() => setMessage('Erro ao carregar perfil.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const updated = await atualizarPerfil(form)
      setProfile(updated)
      setMessage('Perfil atualizado com sucesso!')
    } catch {
      setMessage('Erro ao atualizar perfil.')
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

  const initials = (form.nomeCompleto || profile?.username || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="mt-1 text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {form.fotoPerfil && <AvatarImage src={form.fotoPerfil} alt={initials} />}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{form.nomeCompleto || profile?.username}</CardTitle>
              <CardDescription>{profile?.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seus dados cadastrais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nomeCompleto">Nome Completo</Label>
              <Input
                id="nomeCompleto"
                value={form.nomeCompleto}
                onChange={(e) => handleChange('nomeCompleto', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={profile?.username ?? ''}
                disabled
              />
              <p className="text-xs text-muted-foreground">E-mail não pode ser alterado</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={form.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={profile?.cpf ?? ''}
                disabled
              />
              <p className="text-xs text-muted-foreground">CPF não pode ser alterado</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroCnh">Número da CNH</Label>
              <Input
                id="numeroCnh"
                value={form.numeroCnh}
                onChange={(e) => handleChange('numeroCnh', e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fotoPerfil">URL da Foto de Perfil</Label>
              <Input
                id="fotoPerfil"
                placeholder="https://..."
                value={form.fotoPerfil}
                onChange={(e) => handleChange('fotoPerfil', e.target.value)}
              />
            </div>
          </div>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('Erro') ? 'text-destructive' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
