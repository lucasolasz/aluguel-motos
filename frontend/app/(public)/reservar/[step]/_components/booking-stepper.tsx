'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  id: number
  name: string
}

interface BookingStepperProps {
  steps: Step[]
  currentStep: number
}

export function BookingStepper({ steps, currentStep }: BookingStepperProps) {
  return (
    <nav aria-label="Progresso da reserva">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'relative flex items-center',
              index !== steps.length - 1 && 'flex-1'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  step.id < currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : step.id === currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 bg-background text-muted-foreground'
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:block',
                  step.id <= currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.name}
              </span>
            </div>
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  'mx-4 h-0.5 flex-1',
                  step.id < currentStep
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
