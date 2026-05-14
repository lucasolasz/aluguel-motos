import Link from 'next/link'

const navigation = {
  motos: [
    { name: 'Scooters', href: '/categorias/scooter' },
    { name: 'Scooters Premium', href: '/categorias/scooter-premium' },
    { name: 'Street Premium', href: '/categorias/street-premium' },
    { name: 'Adventure Touring', href: '/categorias/adventure-touring' },
  ],
  empresa: [
    { name: 'Sobre Nós', href: '/sobre' },
    { name: 'Como Funciona', href: '/como-funciona' },
    { name: 'Contato', href: '/contato' },
    { name: 'Trabalhe Conosco', href: '/carreiras' },
  ],
  suporte: [
    { name: 'Central de Ajuda', href: '/ajuda' },
    { name: 'Política de Cancelamento', href: '/cancelamento' },
    { name: 'Termos de Uso', href: '/termos' },
    { name: 'Privacidade', href: '/privacidade' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight">MotoRent</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Alugue a moto dos seus sonhos com segurança e praticidade. 
              Scooters, motos esportivas, touring e muito mais.
            </p>
          </div>

          {/* Motos */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Motos</h3>
            <ul className="mt-4 space-y-3">
              {navigation.motos.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Empresa</h3>
            <ul className="mt-4 space-y-3">
              {navigation.empresa.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Suporte</h3>
            <ul className="mt-4 space-y-3">
              {navigation.suporte.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MotoRent. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
