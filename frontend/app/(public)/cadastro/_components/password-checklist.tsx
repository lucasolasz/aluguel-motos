'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordRule {
  label: string
  test: (s: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Mínimo de 10 caracteres', test: (s) => s.length >= 10 },
  { label: 'Pelo menos 1 caractere especial', test: (s) => /[^A-Za-z0-9]/.test(s) },
  { label: 'Pelo menos 1 letra maiúscula', test: (s) => /[A-Z]/.test(s) },
  { label: 'Pelo menos 1 letra minúscula', test: (s) => /[a-z]/.test(s) },
  { label: 'Pelo menos 1 número', test: (s) => /\d/.test(s) },
]

export function isSenhaForte(senha: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(senha))
}

export function PasswordChecklist({ senha }: { senha: string }) {
  return (
    <ul className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(senha)
        return (
          <li
            key={rule.label}
            className={cn(
              'flex items-center gap-2 text-sm',
              ok ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
