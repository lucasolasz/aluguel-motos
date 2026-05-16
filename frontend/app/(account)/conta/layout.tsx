import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AccountSidebar } from './_components/account-sidebar'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="lg:w-64">
              <AccountSidebar />
            </aside>

            <div className="flex-1">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
