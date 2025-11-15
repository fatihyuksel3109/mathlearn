import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import OTP from '@/models/OTP';
import { sendOTPEmail } from '@/lib/emailService';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, locale = 'tr' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const code = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        code,
        expiresAt,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const emailSent = await sendOTPEmail(email.toLowerCase(), code, locale);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please check SMTP configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'OTP sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

