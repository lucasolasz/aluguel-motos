'use client'

import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CardValidationDialogProps {
  open: boolean
  status: 'loading' | 'success' | 'error'
  errorMessage: string | null
  onConfirm: () => void
  onClose: () => void
}

export function CardValidationDialog({ open, status, errorMessage, onConfirm, onClose }: CardValidationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Validação do Cartão</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {status === 'loading' && (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm font-medium">Cartão validado com sucesso</p>
              <Button onClick={onConfirm} className="w-full">
                Continuar
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-center text-destructive">{errorMessage}</p>
              <Button variant="outline" onClick={onClose} className="w-full">
                Fechar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
