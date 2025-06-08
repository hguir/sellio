'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const isMerchant = session?.user?.role === 'MERCHANT';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Sellio</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Tableau de bord
            </Link>
            {isMerchant && (
              <>
                <Link
                  href="/dashboard/products"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Produits
                </Link>
                <Link
                  href="/dashboard/shop"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Ma boutique
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Commandes
                </Link>
              </>
            )}
            <Link
              href="/dashboard/profile"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Profil
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-300`}>
        <div className="p-8">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
          {children}
        </div>
      </div>
    </div>
  );
} 