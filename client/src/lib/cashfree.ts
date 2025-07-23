declare global {
  interface Window {
    Cashfree: any;
  }
}

export interface CashfreePayment {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingId?: string;
}

export const CASHFREE_CONFIG = {
  appId: import.meta.env.VITE_CASHFREE_APP_ID || "9932874f93878c209926363eb3782399",
  secretKey: import.meta.env.VITE_CASHFREE_SECRET_KEY || "cfsk_ma_prod_ecee2e35c6aee2ed204a5aa421aed9df_4aaad1e2",
  environment: "PRODUCTION", // Use PRODUCTION for live transactions
};

export async function initiateCashfreePayment(paymentData: CashfreePayment): Promise<{ success: boolean; orderId: string }> {
  try {
    if (!window.Cashfree) {
      throw new Error("Cashfree SDK not loaded. Please check your internet connection.");
    }

    // Create order on backend first
    const orderData = {
      order_id: paymentData.orderId,
      order_amount: paymentData.amount,
      order_currency: "INR",
      customer_details: {
        customer_id: paymentData.customerPhone,
        customer_name: paymentData.customerName,
        customer_email: paymentData.customerEmail || `${paymentData.customerPhone.replace(/\D/g, '')}@bookneoapp.com`,
        customer_phone: paymentData.customerPhone,
      },
      order_meta: {
        return_url: `${window.location.origin}/booking-success/${paymentData.bookingId || paymentData.orderId}`,
        notify_url: `${window.location.origin}/api/webhooks/cashfree`,
      },
    };

    console.log("Creating Cashfree order:", orderData);

    const response = await fetch("/api/cashfree/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create payment order");
    }

    const { payment_session_id } = await response.json();

    if (!payment_session_id) {
      throw new Error("Invalid payment session received from server");
    }

    // Initialize Cashfree with production environment
    const cashfree = window.Cashfree.init({
      mode: CASHFREE_CONFIG.environment,
    });

    console.log("Initiating Cashfree checkout with session:", payment_session_id);

    // Create promise to handle payment completion
    return new Promise((resolve, reject) => {
      cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal",
        onSuccess: (data: any) => {
          console.log("Payment successful:", data);
          resolve({ success: true, orderId: paymentData.orderId });
        },
        onFailure: (error: any) => {
          console.error("Payment failed:", error);
          reject(new Error(error.message || "Payment failed"));
        },
        onCancel: () => {
          console.log("Payment cancelled by user");
          reject(new Error("Payment cancelled by user"));
        }
      });
    });

  } catch (error) {
    console.error("Cashfree payment error:", error);
    throw error;
  }
}

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORDER_${timestamp}_${random}`;
}

export async function verifyPayment(orderId: string): Promise<any> {
  try {
    const response = await fetch(`/api/cashfree/order/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to verify payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error;
  }
}

// Load Cashfree SDK dynamically
export function loadCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.prod.js'; // Production SDK
    script.async = true;
    
    script.onload = () => {
      if (window.Cashfree) {
        console.log("Cashfree SDK loaded successfully");
        resolve();
      } else {
        reject(new Error("Cashfree SDK failed to initialize"));
      }
    };
    
    script.onerror = () => {
      reject(new Error("Failed to load Cashfree SDK"));
    };

    document.head.appendChild(script);
  });
}

// Initialize SDK on module load
if (typeof window !== 'undefined') {
  loadCashfreeSDK().catch(console.error);
}
