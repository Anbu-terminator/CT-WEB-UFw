import fetch from 'node-fetch';
import crypto from 'crypto';

interface RazorpayConfig {
  keyId: string;
  secretKey: string;
  baseUrl: string;
}

interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, any>;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
  created_at: number;
}

export class RazorpayService {
  private config: RazorpayConfig;

  constructor() {
    this.config = {
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_uGpEIbyl9tXtTH",
      secretKey: process.env.RAZORPAY_SECRET_KEY || "Ui7CXnrutIKk0Ufrp9dM1NzH",
      baseUrl: "https://api.razorpay.com/v1",
    };
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.config.keyId}:${this.config.secretKey}`).toString('base64');
  }

  async createOrder(orderData: CreateOrderRequest): Promise<RazorpayOrder> {
    try {
      const response = await fetch(`${this.config.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify({
          amount: orderData.amount,
          currency: orderData.currency,
          receipt: orderData.receipt,
          notes: orderData.notes,
          payment_capture: 1 // Auto-capture payments
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.description || 'Failed to create Razorpay order');
      }

      return data;
    } catch (error) {
      console.error('Razorpay createOrder error:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.description || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Razorpay verifyPayment error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
      
    return expectedSignature === signature;
  }

  async refundPayment(paymentId: string, amount: number): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify({
          amount: amount * 100 // Convert to paise
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.description || 'Refund failed');
      }

      return data;
    } catch (error) {
      console.error('Razorpay refundPayment error:', error);
      throw error;
    }
  }
}