import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch('https://blue-penguin-872241.hostingersite.com/api/logout', {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to logout');
    }
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
} 