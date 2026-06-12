import Link from "next/link";
import { HomeLink } from "./home-link";
import Image from "next/image";

const links = [
  { name: "Como Funciona", href: "/como-funciona" },
  { name: "Contato", href: "/contato" },
  { name: "Categorias", href: "/categorias" },
  { name: "Motos", href: "/motos" },
];

const legalLinks = [
  { name: "Termos de Uso", href: "/termos-de-uso" },
  { name: "Portal da Privacidade", href: "/portal-da-privacidade" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary">
              <Image
                src="/images/logo_redonda.png"
                alt="Rio Ride Rental"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Rio Ride Rental
            </span>
          </Link>
        </div>

        {/* Links principais */}
        <nav className="flex flex-wrap gap-x-6 gap-y-3 mb-8">
          <HomeLink className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Aluguel de Motos
          </HomeLink>
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Endereço */}
        <address className="not-italic mb-8 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            RIO MULTIMARCAS OFICINA DAS MOTOS
          </p>
          <p className="text-sm text-muted-foreground">
            Estr. de Camorim, n° 628 - Jacarepaguá, Rio de Janeiro - RJ,
            22780-070
          </p>
          <p className="text-sm text-muted-foreground">
            <a
              href="tel:+5521998884703"
              className="transition-colors hover:text-foreground"
            >
              (21) 99888-4703
            </a>
          </p>
        </address>

        {/* Links legais + copyright */}
        <div className="border-t border-border pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Rio Ride Rental. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
