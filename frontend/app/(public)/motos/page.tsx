import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getMotos } from '@/services/motos.service'
import { getCategorias } from '@/services/categorias.service'
import { MotosList } from './_components/motos-list'

export default async function MotorcyclesPage() {
  const [motos, categorias] = await Promise.all([getMotos(), getCategorias()])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotosList motos={motos} categorias={categorias} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
