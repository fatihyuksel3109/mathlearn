import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    // Get total count of users for debugging
    const totalUsers = await User.countDocuments({});
    console.log(`Total users in database: ${totalUsers}`);

    // Get all users without field selection to ensure we get everyone
    const allUsers = await User.find({})
      .sort({ xp: -1 })
      .limit(20)
      .lean();

    console.log(`Users returned from query: ${allUsers.length}`);

    // Map to only include needed fields and ensure defaults
    const usersWithDefaults = allUsers.map(user => ({
      _id: user._id,
      name: user.name || 'Unknown',
      email: user.email || '',
      avatar: user.avatar || 'fox',
      xp: user.xp ?? 0,
      badges: user.badges ?? [],
    }));

    console.log(`Users after mapping: ${usersWithDefaults.length}`);

    return NextResponse.json({ 
      users: usersWithDefaults,
      total: totalUsers 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

