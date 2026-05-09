
import { Categoria } from '@/lib/types'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface CategoriaCardProps {
  categoria: Categoria
}

export function CategoriaCard({ categoria }: CategoriaCardProps) {
  return (
    <Link
      href={`/categorias/${categoria.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        <Image
          src={categoria.imageUrl || '/images/placeholder-category.jpg'}
          alt={categoria.nome}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white">{categoria.nome}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/80">
            {categoria.descricao}
          </p>
        </div>
      </div>
      {/* <div className="flex items-center justify-between p-4">
        <div className="flex flex-wrap gap-1">
          {categoria.examples.slice(0, 3).map((example) => (
            <span
              key={example}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {example}
            </span>
          ))}
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div> */}
    </Link>
  )
}
