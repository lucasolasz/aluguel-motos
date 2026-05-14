'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, User, Calendar, Settings, LogOut } from 'lucide-react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight">MotoRent</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/categorias"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Categorias
          </Link>
          <Link
            href="/motos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Motos
          </Link>
          <Link
            href="/como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Como Funciona
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Menu do usuário</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/conta" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Minha Conta</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/conta/reservas" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Minhas Reservas</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/conta/perfil" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Painel Admin</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <Link href="/motos">Reservar Agora</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Abrir menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <div className="space-y-1 px-4 py-4">
            <Link
              href="/categorias"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categorias
            </Link>
            <Link
              href="/motos"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Motos
            </Link>
            <Link
              href="/como-funciona"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Como Funciona
            </Link>
            <div className="my-4 border-t border-border" />
            <Link
              href="/conta"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Minha Conta
            </Link>
            <Link
              href="/conta/reservas"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Minhas Reservas
            </Link>
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Painel Admin
            </Link>
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href="/motos" onClick={() => setMobileMenuOpen(false)}>
                  Reservar Agora
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
