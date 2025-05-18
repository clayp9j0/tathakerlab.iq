import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Creating order with data:', body);
    const response = await fetch('https://blue-penguin-872241.hostingersite.com/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        console.error('Order creation failed:', error);
        return NextResponse.json(error, { status: response.status });
      }
      console.error('Order creation failed with status:', response.status);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Order created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 