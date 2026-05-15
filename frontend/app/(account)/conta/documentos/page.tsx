'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react'
import { getMeusDocumentos } from '@/services/documentos.service'
import type { Documento, DocumentoStatus, DocumentoTipo } from '@/lib/types'
import { formatDate } from '@/lib/data'

const tipoLabels: Record<DocumentoTipo, string> = {
  CNH_FRENTE: 'CNH - Frente',
  CNH_VERSO: 'CNH - Verso',
  SELFIE_COM_DOCUMENTO: 'Selfie com Documento',
}

const statusConfig: Record<
  DocumentoStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline'; icon: typeof CheckCircle }
> = {
  VERIFICADO: { label: 'Verificado', variant: 'default', icon: CheckCircle },
  PENDENTE: { label: 'Em análise', variant: 'secondary', icon: Clock },
  RECUSADO: { label: 'Recusado', variant: 'outline', icon: XCircle },
}

const TIPOS_NECESSARIOS: DocumentoTipo[] = ['CNH_FRENTE', 'CNH_VERSO', 'SELFIE_COM_DOCUMENTO']

export default function DocumentsPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMeusDocumentos()
      .then(setDocumentos)
      .catch(() => setError('Erro ao carregar documentos.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  const documentosPorTipo = new Map(documentos.map((d) => [d.tipo, d]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meus Documentos</h1>
        <p className="mt-1 text-muted-foreground">
          Visualize o status dos seus documentos enviados
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Documentos de Verificação (KYC)</CardTitle>
          <CardDescription>Documentos necessários para realizar reservas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TIPOS_NECESSARIOS.map((tipo) => {
              const doc = documentosPorTipo.get(tipo)

              if (!doc) {
                return (
                  <div
                    key={tipo}
                    className="flex items-center justify-between rounded-lg border border-dashed border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tipoLabels[tipo]}</p>
                        <p className="text-sm text-muted-foreground">Não enviado</p>
                      </div>
                    </div>
                    <Badge variant="outline">Pendente</Badge>
                  </div>
                )
              }

              const status = statusConfig[doc.status]
              const StatusIcon = status.icon

              return (
                <div
                  key={tipo}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tipoLabels[tipo]}</p>
                      <p className="text-sm text-muted-foreground">
                        Enviado em {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
