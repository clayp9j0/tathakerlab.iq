import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ hello: 'register' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Convert JSON to FormData
    const formData = new FormData();
    formData.append('name', body.name);
    formData.append('phone', body.phone);
    formData.append('password', body.password);
    formData.append('password_confirmation', body.password_confirmation);

    const response = await fetch('https://blue-penguin-872241.hostingersite.com/api/register', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to register');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
} 