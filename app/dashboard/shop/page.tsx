'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ShopSettings {
  name: string;
  description: string;
  logo: string;
  banner: string;
  theme: 'sellio' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  id: string;
}

const SELLIO_THEME = {
  primaryColor: '#2563EB', // Bleu Sellio
  secondaryColor: '#1E40AF', // Bleu foncé Sellio
};

// Fonction utilitaire pour uploader un fichier et retourner l'URL
async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (res.ok) {
    const data = await res.json();
    return data.url;
  }
  return null;
}

export default function ShopSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<ShopSettings>({
    name: '',
    description: '',
    logo: '',
    banner: '',
    theme: 'sellio',
    primaryColor: SELLIO_THEME.primaryColor,
    secondaryColor: SELLIO_THEME.secondaryColor,
    currency: 'XOF',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialMedia: {},
    id: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchShopSettings();
    }
  }, [status, router]);

  const fetchShopSettings = async () => {
    try {
      const response = await fetch('/api/shop/settings');
      if (!response.ok) throw new Error('Erreur lors de la récupération des paramètres');
      const data = await response.json();

      // Nettoyer toutes les valeurs nulles
      setSettings({
        ...data,
        name: data.name ?? '',
        description: data.description ?? '',
        logo: data.logo ?? '',
        banner: data.banner ?? '',
        theme: data.theme ?? 'sellio',
        primaryColor: data.primaryColor ?? SELLIO_THEME.primaryColor,
        secondaryColor: data.secondaryColor ?? SELLIO_THEME.secondaryColor,
        currency: data.currency ?? 'XOF',
        contactEmail: data.contactEmail ?? '',
        contactPhone: data.contactPhone ?? '',
        address: data.address ?? '',
        socialMedia: data.socialMedia ?? {},
        id: data.id ?? '',
      });
    } catch (err) {
      setError('Impossible de charger les paramètres de la boutique');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (theme: 'sellio' | 'custom') => {
    if (theme === 'sellio') {
      setSettings({
        ...settings,
        theme,
        primaryColor: SELLIO_THEME.primaryColor,
        secondaryColor: SELLIO_THEME.secondaryColor,
      });
    } else {
      setSettings({
        ...settings,
        theme,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Nettoyer les champs pour éviter d'envoyer null ou undefined
    const cleanSettings: any = { ...settings };
    if (cleanSettings.address == null) {
      cleanSettings.address = '';
    }
    if (
      cleanSettings.socialMedia == null ||
      (typeof cleanSettings.socialMedia === 'object' &&
        Object.values(cleanSettings.socialMedia).every((v: any) => !v))
    ) {
      cleanSettings.socialMedia = {};
    }

    try {
      const response = await fetch('/api/shop/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanSettings),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde des paramètres');
      setSuccess('Paramètres sauvegardés avec succès');
    } catch (err) {
      setError('Erreur lors de la sauvegarde des paramètres');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Personnalisation de la boutique</h1>

      {/* Bouton voir la boutique */}
      {settings && (
        <div className="mb-6">
          <a
            href={`/shops/${settings.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition-colors"
          >
            Voir ma boutique en ligne
          </a>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Informations de base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom de la boutique
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Apparence */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Apparence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await uploadImage(file);
                    if (url) {
                      setSettings({ ...settings, logo: url });
                    }
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {settings.logo && (
                <img src={settings.logo} alt="Logo" className="mt-2 h-16" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bannière
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await uploadImage(file);
                    if (url) {
                      setSettings({ ...settings, banner: url });
                    }
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {settings.banner && (
                <img src={settings.banner} alt="Bannière" className="mt-2 h-16" />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thème
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleThemeChange('sellio')}
                  className={`px-4 py-2 rounded-md ${
                    settings.theme === 'sellio'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Thème Sellio
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('custom')}
                  className={`px-4 py-2 rounded-md ${
                    settings.theme === 'custom'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Thème personnalisé
                </button>
              </div>
            </div>
            {settings.theme === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Couleur principale
                  </label>
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Couleur secondaire
                  </label>
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, secondaryColor: e.target.value })
                    }
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Informations de contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email de contact
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings({ ...settings, contactEmail: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) =>
                  setSettings({ ...settings, contactPhone: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Adresse (optionnelle)
              </label>
              <textarea
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
                placeholder="Adresse de la boutique (facultatif)"
              />
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Réseaux sociaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Facebook (optionnel)
              </label>
              <input
                type="url"
                value={settings.socialMedia?.facebook || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      facebook: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="URL de la page Facebook (facultatif)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instagram (optionnel)
              </label>
              <input
                type="url"
                value={settings.socialMedia?.instagram || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      instagram: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="URL du profil Instagram (facultatif)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter (optionnel)
              </label>
              <input
                type="url"
                value={settings.socialMedia?.twitter || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      twitter: e.target.value,
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="URL du profil Twitter (facultatif)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
} 