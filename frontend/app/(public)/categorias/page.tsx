import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CategoriaCard } from '@/components/categoria-card'
import { getCategorias } from '@/services/categorias.service'

export const metadata = {
  title: 'Categorias de Motos - MotoRent',
  description: 'Explore nossas categorias de motos: scooters, motos esportivas, touring, adventure e muito mais.',
}

export default async function CategoriesPage() {
  const categorias = await getCategorias()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-primary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Categorias de Motos
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Encontre a moto perfeita para sua necessidade. De scooters urbanas a motos de aventura.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {categorias.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categorias.map((categoria) => (
                  <CategoriaCard key={categoria.id} categoria={categoria} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nenhuma categoria disponível.</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
