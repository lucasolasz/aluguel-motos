'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'
import { User, Calendar, FileText, Settings } from 'lucide-react'

const navigation = [
  { name: 'Minhas Reservas', href: '/conta/reservas', icon: Calendar },
  { name: 'Meu Perfil', href: '/conta/perfil', icon: User },
  { name: 'Documentos', href: '/conta/documentos', icon: FileText },
  { name: 'Configurações', href: '/conta/configuracoes', icon: Settings },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar */}
            <aside className="lg:w-64">
              <nav className="flex gap-2 overflow-x-auto lg:flex-col">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
