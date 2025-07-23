declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayErrorResponse) => void) => void;
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

export interface RazorpayPayment {
  orderId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingId?: string;
}

export const RAZORPAY_CONFIG = {
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_uGpEIbyl9tXtTH",
  currency: "INR",
};

export async function initiateRazorpayPayment(paymentData: RazorpayPayment): Promise<{ success: boolean; orderId: string }> {
  try {
    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }

    const orderResponse = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: paymentData.amount * 100,
        currency: RAZORPAY_CONFIG.currency,
        receipt: paymentData.orderId,
        notes: {
          bookingId: paymentData.bookingId,
          customerPhone: paymentData.customerPhone
        }
      })
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      throw new Error(error.message || "Order creation failed");
    }

    const order = await orderResponse.json();

    const options = {
      key: RAZORPAY_CONFIG.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "BookNeo",
      description: "Room Booking Payment",
      order_id: order.id,
      handler: function(response: any) {
        window.location.href = `/booking-success/${paymentData.bookingId || paymentData.orderId}?payment_id=${response.razorpay_payment_id}`;
      },
      prefill: {
        name: paymentData.customerName,
        email: paymentData.customerEmail || "",
        contact: paymentData.customerPhone
      },
      theme: {
        color: "#2563eb"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

    return new Promise((resolve) => {
      rzp.on("payment.failed", (response: any) => {
        window.location.href = `/booking-failure?error=${encodeURIComponent(response.error.description)}`;
        resolve({ success: false, orderId: paymentData.orderId });
      });
    });

  } catch (error) {
    console.error("Razorpay error:", error);
    throw error;
  }
}

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORDER_${timestamp}_${random}`;
}

export function loadRazorpaySDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      if (window.Razorpay) {
        resolve();
      } else {
        reject(new Error("Razorpay SDK failed to load"));
      }
    };
    
    script.onerror = () => {
      reject(new Error("Failed to load Razorpay SDK"));
    };

    document.head.appendChild(script);
  });
}

if (typeof window !== 'undefined') {
  loadRazorpaySDK().catch(console.error);
}