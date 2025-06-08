import { useState } from 'react';

interface PaymentButtonProps {
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function PaymentButton({
  amount,
  currency,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du paiement');
      }

      // Rediriger vers la page de paiement CinetPay
      window.location.href = data.payment_url;
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Traitement...' : 'Payer avec CinetPay'}
    </button>
  );
} 