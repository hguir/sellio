import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bienvenue sur Sellio
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Créez votre boutique en ligne en quelques clics avec nos templates personnalisables
          </p>
          <div className="space-x-4">
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer ma boutique
            </Link>
            <Link
              href="/shops"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Découvrir les boutiques
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Templates Personnalisables</h3>
            <p className="text-gray-600">
              Choisissez parmi nos templates modernes et adaptez-les à votre image de marque
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Gestion Simplifiée</h3>
            <p className="text-gray-600">
              Gérez vos produits, stocks et commandes depuis une interface intuitive
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Paiements Sécurisés</h3>
            <p className="text-gray-600">
              Acceptez les paiements en ligne de manière sécurisée avec Stripe
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 