'use client'

import React from 'react'
import { IMaskInput } from 'react-imask'
import { cn } from '@/lib/utils'

const INPUT_CLASS =
  'h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30'

interface MaskedInputProps {
  mask: string
  value: string
  onAccept: (value: string) => void
  id?: string
  placeholder?: string
  className?: string
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  disabled?: boolean
  inputMode?: 'numeric' | 'text' | 'email' | 'tel'
}

export function MaskedInput({ mask, value, onAccept, className, ...props }: MaskedInputProps) {
  return (
    <IMaskInput
      mask={mask}
      value={value}
      onAccept={onAccept}
      className={cn(INPUT_CLASS, className)}
      {...props}
    />
  )
}
