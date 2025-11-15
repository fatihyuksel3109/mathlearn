import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const topUsers = await User.find({})
      .select('name email avatar xp badges')
      .sort({ xp: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ users: topUsers }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

