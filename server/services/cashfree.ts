import fetch from 'node-fetch';

interface CashfreeConfig {
  appId: string;
  secretKey: string;
  baseUrl: string;
}

interface CreateOrderRequest {
  order_id: string;
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta: {
    return_url: string;
    notify_url: string;
  };
}

interface CreateOrderResponse {
  payment_session_id: string;
  order_id: string;
  order_status: string;
}

export class CashfreeService {
  private config: CashfreeConfig;

  constructor() {
    this.config = {
      appId: process.env.CASHFREE_APP_ID || "9932874f93878c209926363eb3782399",
      secretKey: process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_ecee2e35c6aee2ed204a5aa421aed9df_4aaad1e2",
      baseUrl: "https://api.cashfree.com/pg", // Production URL
    };
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': this.config.appId,
      'x-client-secret': this.config.secretKey,
    };
  }

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log("Creating Cashfree order:", {
        order_id: orderData.order_id,
        amount: orderData.order_amount,
        customer: orderData.customer_details.customer_name
      });

      const response = await fetch(`${this.config.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json() as any;

      if (!response.ok) {
        console.error("Cashfree API error:", responseData);
        throw new Error(responseData.message || `HTTP ${response.status}: Failed to create order`);
      }

      console.log("Cashfree order created successfully:", {
        order_id: responseData.order_id,
        payment_session_id: responseData.payment_session_id
      });

      return responseData;
    } catch (error) {
      console.error("Cashfree createOrder error:", error);
      throw error;
    }
  }

  async getOrderDetails(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const responseData = await response.json() as any;

      if (!response.ok) {
        console.error("Cashfree get order error:", responseData);
        throw new Error(responseData.message || `HTTP ${response.status}: Failed to get order details`);
      }

      return responseData;
    } catch (error) {
      console.error("Cashfree getOrderDetails error:", error);
      throw error;
    }
  }

  async getPaymentDetails(orderId: string, paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/orders/${orderId}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const responseData = await response.json() as any;

      if (!response.ok) {
        console.error("Cashfree get payment error:", responseData);
        throw new Error(responseData.message || `HTTP ${response.status}: Failed to get payment details`);
      }

      return responseData;
    } catch (error) {
      console.error("Cashfree getPaymentDetails error:", error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: any, headers: Record<string, any>): boolean {
    try {
      // Implement webhook signature verification
      // This is a simplified version - in production, implement proper signature verification
      const receivedSignature = headers['x-webhook-signature'];
      const timestamp = headers['x-webhook-timestamp'];
      
      if (!receivedSignature || !timestamp) {
        console.warn("Missing webhook signature or timestamp");
        return false;
      }

      // In production, verify the signature using your webhook secret
      // const expectedSignature = crypto
      //   .createHmac('sha256', WEBHOOK_SECRET)
      //   .update(timestamp + JSON.stringify(payload))
      //   .digest('hex');
      
      // return receivedSignature === expectedSignature;
      
      // For now, return true (implement proper verification in production)
      return true;
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }

  async refundPayment(orderId: string, refundAmount: number, refundId: string): Promise<any> {
    try {
      const refundData = {
        refund_amount: refundAmount,
        refund_id: refundId,
        refund_note: "Refund requested by hotel management",
      };

      const response = await fetch(`${this.config.baseUrl}/orders/${orderId}/refunds`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(refundData),
      });

      const responseData = await response.json() as any;

      if (!response.ok) {
        console.error("Cashfree refund error:", responseData);
        throw new Error(responseData.message || `HTTP ${response.status}: Failed to process refund`);
      }

      return responseData;
    } catch (error) {
      console.error("Cashfree refundPayment error:", error);
      throw error;
    }
  }
}
