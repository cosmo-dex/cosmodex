import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId = 'pro_monthly',
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // 1. Verify HMAC-SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Calculate subscription expiry (e.g., 30 days for monthly)
    const durationDays = planId === 'pro_yearly' ? 365 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // 3. Update User Subscription in Database
    await prisma.users.update({
      where: { id: userId },
      data: {
        role: 'pro',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully!',
      expiresAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    console.error('[Razorpay Verify Error]:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
