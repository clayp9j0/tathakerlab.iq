import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://blue-penguin-872241.hostingersite.com/api/banners');
    if (!response.ok) {
      throw new Error('Failed to fetch banners');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
} 