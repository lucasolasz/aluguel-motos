import { CategoriaCard } from "@/components/categoria-card";
import { MotoCard } from "@/components/moto-card";
import { Button } from "@/components/ui/button";
import { getCategorias } from "@/services/categorias.service";
import { getMotos } from "@/services/motos.service";
import Link from "next/link";
import { Features } from "./_components/features";
import { SearchForm } from "./_components/search-form";

export default async function HomePage() {
  const featuredCategories = await getCategorias();
  const featuredMotorcycles = await getMotos();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary py-20 lg:py-32">
          <div className="absolute inset-0 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center bg-no-repeat opacity-15" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                Alugue a moto dos seus sonhos
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
                De scooters econômicas a motos premium. Encontre a moto perfeita
                para sua aventura com preços acessíveis e processo 100% digital.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-4xl">
              <SearchForm categories={featuredCategories} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-b border-border bg-card py-12">
         <Features />
        </section>

        {/* Featured Motorcycles Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Motos em Destaque
                </h2>
                <p className="mt-2 text-muted-foreground">
                  As motos mais populares da nossa frota
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/motos">Ver todas</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredMotorcycles.map((moto) => (
                <MotoCard key={moto.id} moto={moto} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/motos">Ver todas as motos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-muted/50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Categorias
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Encontre a moto ideal para seu estilo
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/categorias">Ver todas</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCategories.slice(0, 4).map((categoria) => (
                <CategoriaCard key={categoria.id} categoria={categoria} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/categorias">Ver todas as categorias</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="bg-primary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Pronto para sua próxima aventura?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                Junte-se a milhares de motociclistas que já descobriram a
                liberdade de alugar com a MotoRent.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/motos">Explorar Motos</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/como-funciona">Como Funciona</Link>
                </Button>
              </div>
            </div>
          </div>
        </section> */}

        {/* How it Works Section */}
        {/* <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Como Funciona
              </h2>
              <p className="mt-2 text-muted-foreground">
                Alugar uma moto nunca foi tão fácil
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  Escolha sua Moto
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Navegue por nossa frota e encontre a moto perfeita para você.
                </p>
              </div>
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  Faça sua Reserva
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Escolha as datas, seguro e acessórios. Pagamento seguro
                  online.
                </p>
              </div>
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  Aproveite a Viagem
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Retire sua moto e curta a liberdade sobre duas rodas.
                </p>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      {/* <Footer /> */}
    </div>
  );
}
