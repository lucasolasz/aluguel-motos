import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { getAcessorios } from '@/services/acessorios.service'
import { getMotoById } from '@/services/motos.service'
import { getSeguros } from '@/services/seguros.service'
import Link from 'next/link'
import { BookingPageClient } from './_components/booking-page-client'

interface BookingPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = await params

  let moto
  try {
    moto = await getMotoById(id)
  } catch {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Moto não encontrada</h1>
            <Button asChild className="mt-4">
              <Link href="/motos">Ver todas as motos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const [seguros, acessorios] = await Promise.all([getSeguros(), getAcessorios()])

  return <BookingPageClient moto={moto} seguros={seguros} acessorios={acessorios} />
}
