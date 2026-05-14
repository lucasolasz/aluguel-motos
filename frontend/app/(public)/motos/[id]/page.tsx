import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMotoById, getMotos } from '@/services/motos.service'
import { getAcessorios } from '@/services/acessorios.service'
import { getSeguros } from '@/services/seguros.service'
import { ArrowLeft, Check, Shield, Gauge, Fuel, Weight, Cog, ArrowUpDown } from 'lucide-react'

interface MotorcycleDetailPageProps {
  params: Promise<{ id: string }>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export async function generateStaticParams() {
  const motos = await getMotos()
  return motos.map((moto) => ({ id: moto.id }))
}

export async function generateMetadata({ params }: MotorcycleDetailPageProps) {
  const { id } = await params
  try {
    const moto = await getMotoById(id)
    return {
      title: `${moto.nome} - Aluguel - MotoRent`,
      description: `Alugue a ${moto.nome} por ${formatCurrency(moto.precoPorDia)}/dia. ${moto.motor}, ${moto.potencia}.`,
    }
  } catch {
    return { title: 'Moto não encontrada - MotoRent' }
  }
}

export default async function MotorcycleDetailPage({ params }: MotorcycleDetailPageProps) {
  const { id } = await params

  let moto
  try {
    moto = await getMotoById(id)
  } catch {
    notFound()
  }

  const [acessorios, seguros] = await Promise.all([getAcessorios(), getSeguros()])

  const fotoPrincipal =
    moto.fotos.find((f) => f.principal)?.url ||
    moto.fotos[0]?.url ||
    '/images/placeholder-moto.jpg'

  const specs = [
    { icon: Gauge, label: 'Motor', value: moto.motor },
    { icon: Cog, label: 'Potência', value: moto.potencia },
    { icon: ArrowUpDown, label: 'Câmbio', value: moto.transmissao },
    { icon: Fuel, label: 'Tanque', value: moto.capacidadeTanque },
    { icon: Weight, label: 'Peso', value: moto.peso },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/motos">
                <ArrowLeft className="h-4 w-4" />
                Voltar para motos
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <section className="py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-transparent border shadow-sm">
                  <Image
                    src={fotoPrincipal}
                    alt={moto.nome}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain object-center"
                    priority
                  />
                  <Badge className="absolute left-4 top-4" variant="secondary">
                    {moto.categoria.nome}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {moto.marca} {moto.ano}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                    {moto.nome}
                  </h1>
                </div>

                {/* Price */}
                <div className="rounded-xl border border-border shadow-sm bg-card p-6">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(moto.precoPorDia)}
                      </p>
                      <p className="text-sm text-muted-foreground">por dia</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Caução</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(moto.caucao)}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="lg" className="mt-6 w-full" disabled={!moto.disponivel}>
                    <Link href={`/reservar/${moto.id}`}>
                      {moto.disponivel ? 'Reservar Agora' : 'Indisponível'}
                    </Link>
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Seguro básico incluso no valor da diária
                  </p>
                </div>

                {/* Specifications */}
                <Card className='shadow-sm'>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Especificações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {specs.map((spec) => (
                        <div key={spec.label} className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <spec.icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{spec.label}</p>
                            <p className="text-sm font-medium text-foreground">{spec.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card className='shadow-sm'>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Recursos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {moto.itens.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Insurance Options */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground">Opções de Seguro</h2>
              <p className="mt-1 text-muted-foreground">
                Escolha a proteção ideal para sua viagem
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {seguros.map((seguro) => (
                  <Card key={seguro.id} className={seguro.basico ? 'border border-green-500 shadow-sm' : 'shadow-sm'}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{seguro.nome}</CardTitle>
                        {seguro.basico && <Badge variant="secondary">Incluso</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{seguro.descricao}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-foreground">
                          {seguro.precoPorDia === 0 ? 'Grátis' : formatCurrency(seguro.precoPorDia)}
                        </p>
                        {seguro.precoPorDia > 0 && (
                          <p className="text-xs text-muted-foreground">por dia</p>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {seguro.coberturas.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm">
                            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground">Acessórios Opcionais</h2>
              <p className="mt-1 text-muted-foreground">
                Complemente sua experiência com nossos acessórios
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {acessorios.map((acessorio) => (
                  <Card key={acessorio.id} className='shadow-sm'>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium text-foreground">{acessorio.nome}</p>
                        <p className="text-sm text-muted-foreground">{acessorio.descricao}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(acessorio.precoPorDia)}
                        </p>
                        <p className="text-xs text-muted-foreground">/dia</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
