import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch('https://blue-penguin-872241.hostingersite.com/api/wallet/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Failed to deposit money');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error during wallet deposit:', error);
    return NextResponse.json({ error: 'Failed to deposit money' }, { status: 500 });
  }
} 