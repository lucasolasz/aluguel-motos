import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MotoCard } from '@/components/moto-card'
import { Button } from '@/components/ui/button'
import { getCategoriaBySlug } from '@/services/categorias.service'
import { getMotosByCategoriaSlug } from '@/services/motos.service'
import { ArrowLeft } from 'lucide-react'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const categoria = await getCategoriaBySlug(slug)

  if (!categoria) {
    return { title: 'Categoria não encontrada - MotoRent' }
  }

  return {
    title: `${categoria.nome} - MotoRent`,
    description: categoria.descricao,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const [categoria, motos] = await Promise.all([
    getCategoriaBySlug(slug),
    getMotosByCategoriaSlug(slug),
  ])

  if (!categoria) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-primary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="sm" asChild className="mb-6 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/categorias" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para categorias
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              {categoria.nome}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
              {categoria.descricao}
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {motos.length > 0 ? (
              <>
                <p className="mb-6 text-muted-foreground">
                  {motos.length} {motos.length === 1 ? 'moto disponível' : 'motos disponíveis'}
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {motos.map((moto) => (
                    <MotoCard key={moto.id} moto={moto} />
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  Nenhuma moto disponível nesta categoria no momento.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/motos">Ver todas as motos</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
