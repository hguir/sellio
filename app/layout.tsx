import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProviders from './ClientProviders'
import Cart from './components/Cart'
import NotificationBell from './components/NotificationBell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sellio - Votre marketplace en ligne',
  description: 'Achetez et vendez en ligne facilement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ClientProviders>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                  <a href="/" className="text-2xl font-bold text-blue-600">
                    Sellio
                  </a>
                  <div className="flex items-center space-x-4">
                    <Cart />
                    <NotificationBell />
                  </div>
                </div>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </ClientProviders>
        <footer className="bg-gray-50 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2024 Sellio. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
} 