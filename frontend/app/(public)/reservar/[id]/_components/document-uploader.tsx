'use client'

import { useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, FileText, User, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentUploaderProps {
  documents: {
    cnhFront: File | null
    cnhBack: File | null
    selfie: File | null
  }
  onUpdate: (field: 'cnhFront' | 'cnhBack' | 'selfie', file: File | null) => void
}

const documentTypes = [
  {
    id: 'cnhFront' as const,
    label: 'CNH - Frente',
    description: 'Foto da frente da sua carteira de habilitação',
    icon: FileText,
  },
  {
    id: 'cnhBack' as const,
    label: 'CNH - Verso',
    description: 'Foto do verso da sua carteira de habilitação',
    icon: FileText,
  },
  {
    id: 'selfie' as const,
    label: 'Selfie com Documento',
    description: 'Foto sua segurando a CNH ao lado do rosto',
    icon: User,
  },
]

export function DocumentUploader({ documents, onUpdate }: DocumentUploaderProps) {
  const handleFileChange = useCallback(
    (field: 'cnhFront' | 'cnhBack' | 'selfie', file: File | null) => {
      onUpdate(field, file)
    },
    [onUpdate]
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Verificação de Documentos</h2>
        <p className="mt-1 text-muted-foreground">
          Envie os documentos necessários para validar sua identidade (KYC)
        </p>
      </div>

      <div className="grid gap-4">
        {documentTypes.map((docType) => {
          const file = documents[docType.id]
          
          return (
            <Card key={docType.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <docType.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{docType.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {docType.description}
                    </p>
                    
                    {file ? (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          <span className="max-w-[200px] truncate text-foreground">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleFileChange(docType.id, null)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remover</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <label
                          htmlFor={`file-${docType.id}`}
                          className={cn(
                            'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground'
                          )}
                        >
                          <Upload className="h-4 w-4" />
                          <span>Clique para enviar</span>
                        </label>
                        <input
                          id={`file-${docType.id}`}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0] || null
                            handleFileChange(docType.id, selectedFile)
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        * Os documentos serão enviados de forma segura para AWS S3 e utilizados apenas para verificação de identidade.
      </p>
    </div>
  )
}
