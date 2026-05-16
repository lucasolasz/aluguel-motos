'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaqItem {
  question: string
  answer: string
}

interface FaqCategory {
  title: string
  items: FaqItem[]
}

interface FaqAccordionProps {
  categories: FaqCategory[]
}

function FaqItem({ question, answer }: FaqItem) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-medium text-foreground sm:text-base">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="pb-5 pr-8 text-sm leading-relaxed text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  )
}

export function FaqAccordion({ categories }: FaqAccordionProps) {
  const [activeCategory, setActiveCategory] = useState(0)

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Category tabs */}
      <div className="lg:w-64 shrink-0">
        <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
          {categories.map((cat, i) => (
            <button
              key={cat.title}
              type="button"
              onClick={() => setActiveCategory(i)}
              className={cn(
                'whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium text-left transition-colors',
                activeCategory === i
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {cat.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Questions */}
      <div className="flex-1 rounded-xl border border-border bg-card px-6">
        {categories[activeCategory].items.map((item) => (
          <FaqItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  )
}
