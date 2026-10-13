import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

// Define your subscription plans
const PLANS: Record<string, { amountInPaise: number; name: string; durationDays: number }> = {
  pro_monthly: {
    amountInPaise: 49900, // ₹499
    name: 'CosmoDex Pro (Monthly)',
    durationDays: 30,
  },
  pro_yearly: {
    amountInPaise: 499900, // ₹4999
    name: 'CosmoDex Pro (Yearly)',
    durationDays: 365,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId = 'pro_monthly', userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Generate unique receipt
    const receipt = `sub_${userId.slice(0, 8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: plan.amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        userId,
        planId,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create Razorpay order';
    console.error('[Razorpay Create Order Error]:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
