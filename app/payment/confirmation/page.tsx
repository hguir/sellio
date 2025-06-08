'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentConfirmation() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const transactionId = searchParams.get('transaction_id');
        
        if (!transactionId) {
          setStatus('error');
          setMessage('ID de transaction manquant');
          return;
        }

        const response = await fetch(`/api/payment?transaction_id=${transactionId}`);
        const data = await response.json();

        if (data.status === 'ACCEPTED') {
          setStatus('success');
          setMessage('Paiement effectué avec succès !');
        } else {
          setStatus('error');
          setMessage('Le paiement a échoué. Veuillez réessayer.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification du paiement.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          )}
          
          {status === 'success' && (
            <div className="text-green-500 text-5xl mb-4">✓</div>
          )}
          
          {status === 'error' && (
            <div className="text-red-500 text-5xl mb-4">✕</div>
          )}

          <h2 className="text-2xl font-semibold mb-4">
            {status === 'loading' && 'Vérification du paiement...'}
            {status === 'success' && 'Paiement réussi !'}
            {status === 'error' && 'Erreur de paiement'}
          </h2>

          <p className="text-gray-600 mb-8">{message}</p>

          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 