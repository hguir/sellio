'use client';

import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return <div>Vous devez être connecté pour voir votre profil.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p><strong>Nom :</strong> {session.user.name}</p>
        <p><strong>Email :</strong> {session.user.email}</p>
        {/* Ajoute ici d'autres infos ou un formulaire de modification si tu veux */}
      </div>
    </div>
  );
} 