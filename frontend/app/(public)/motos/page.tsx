import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getMotos } from '@/services/motos.service'
import { getCategorias } from '@/services/categorias.service'
import { getLocais } from '@/services/locais.service'
import { MotosList } from './_components/motos-list'

interface MotorcyclesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function normalize(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

export default async function MotorcyclesPage({ searchParams }: MotorcyclesPageProps) {
  const sp = await searchParams
  const pickup = normalize(sp.pickup)
  const returnIso = normalize(sp.return)
  const dataRetirada = pickup ? pickup.slice(0, 10) : undefined
  const dataDevolucao = returnIso ? returnIso.slice(0, 10) : undefined

  const flatParams: Record<string, string> = {}
  for (const [k, v] of Object.entries(sp)) {
    const n = normalize(v)
    if (n) flatParams[k] = n
  }

  const [motos, categorias, locais] = await Promise.all([
    getMotos({ dataRetirada, dataDevolucao }),
    getCategorias(),
    getLocais(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotosList motos={motos} categorias={categorias} searchParams={flatParams} locais={locais} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
