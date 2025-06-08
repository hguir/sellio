import axios from 'axios';

interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  notifyUrl: string;
  returnUrl: string;
}

interface PaymentData {
  amount: number;
  currency: string;
  transId: string;
  designation: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export class CinetPayService {
  private apiKey: string;
  private siteId: string;
  private notifyUrl: string;
  private returnUrl: string;
  private baseUrl = 'https://api-checkout.cinetpay.com/v2';

  constructor(config: CinetPayConfig) {
    this.apiKey = config.apiKey;
    this.siteId = config.siteId;
    this.notifyUrl = config.notifyUrl;
    this.returnUrl = config.returnUrl;
  }

  async initiatePayment(data: PaymentData) {
    try {
      const response = await axios.post(`${this.baseUrl}/payment`, {
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: data.transId,
        amount: data.amount,
        currency: data.currency,
        designation: data.designation,
        channels: 'ALL',
        lang: 'fr',
        metadata: {
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone,
        },
        notify_url: this.notifyUrl,
        return_url: this.returnUrl,
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement:', error);
      throw error;
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/payment/check`, {
        params: {
          apikey: this.apiKey,
          site_id: this.siteId,
          transaction_id: transactionId,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      throw error;
    }
  }
} 