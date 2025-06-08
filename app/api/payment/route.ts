import { NextResponse } from 'next/server';
import { CinetPayService } from '@/lib/cinetpay';

const cinetpay = new CinetPayService({
  apiKey: process.env.CINETPAY_API_KEY || '',
  siteId: process.env.CINETPAY_SITE_ID || '',
  notifyUrl: `${process.env.NEXTAUTH_URL}/api/payment/notify`,
  returnUrl: `${process.env.NEXTAUTH_URL}/payment/confirmation`,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, customerName, customerEmail, customerPhone } = body;

    // Générer un ID de transaction unique
    const transId = `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const paymentData = {
      amount,
      currency,
      transId,
      designation: 'Paiement Sellio',
      customerName,
      customerEmail,
      customerPhone,
    };

    const response = await cinetpay.initiatePayment(paymentData);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du paiement' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID de transaction manquant' },
        { status: 400 }
      );
    }

    const verification = await cinetpay.verifyPayment(transactionId);
    return NextResponse.json(verification);
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du paiement' },
      { status: 500 }
    );
  }
} 