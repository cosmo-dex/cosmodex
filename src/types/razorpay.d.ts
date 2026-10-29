declare module 'razorpay' {
  interface RazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
  }

  interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status?: string;
  }

  interface RazorpayOrders {
    create(options: RazorpayOrderOptions): Promise<RazorpayOrder>;
  }

  export interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  export default class Razorpay {
    constructor(options: RazorpayOptions);
    orders: RazorpayOrders;
  }
}
