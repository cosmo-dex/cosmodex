'use client';

import { useState } from 'react';

interface SubscribeButtonProps {
  userId: string;
  userEmail?: string;
  userName?: string;
  planId?: 'pro_monthly' | 'pro_yearly';
  className?: string;
  onSuccess?: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => Promise<void> | void;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// Helper to dynamically load checkout.js
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function SubscribeButton({
  userId,
  userEmail = '',
  userName = '',
  planId = 'pro_monthly',
  className = '',
  onSuccess,
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        alert('Failed to load Razorpay payment gateway. Please check your internet connection.');
        return;
      }

      // 1. Create order from backend
      const res = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId }),
      });

      const orderData = await res.json();
      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      // 2. Open Razorpay Modal
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CosmoDex',
        description: orderData.planName,
        order_id: orderData.orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#6366f1', // Indigo / Cosmo brand color
        },
        handler: async function (response: RazorpayResponse) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/subscription/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId,
              planId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            alert('🎉 Welcome to CosmoDex Pro! Your subscription is active.');
            if (onSuccess) onSuccess();
            window.location.reload();
          } else {
            alert(verifyData.error || 'Payment verification failed');
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong during checkout';
      console.error(err);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className || "px-6 py-3 font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 cursor-pointer"}
    >
      {loading ? 'Processing…' : 'Upgrade to Pro'}
    </button>
  );
}
