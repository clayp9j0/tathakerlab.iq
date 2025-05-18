import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://blue-penguin-872241.hostingersite.com/api/events/active');
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
} 