import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const response = await fetch(`https://blue-penguin-872241.hostingersite.com/api/events/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch event details');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json({ error: 'Failed to fetch event details' }, { status: 500 });
  }
} 