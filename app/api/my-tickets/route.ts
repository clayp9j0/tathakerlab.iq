import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Received request for tickets with auth header:', authHeader ? 'Present' : 'Missing');
    console.log('Auth header value:', authHeader);

    if (!authHeader) {
      console.log('No authorization header found');
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    console.log('Fetching tickets from backend...');
    const response = await fetch('https://blue-penguin-872241.hostingersite.com/api/my-tickets', {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from backend:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch tickets', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Raw tickets data:', data);
    console.log('Data type:', typeof data);
    console.log('Is array?', Array.isArray(data));
    console.log('Data keys:', Object.keys(data));
    
    // If data is nested in a data property, extract it
    const ticketsData = data.data || data;
    console.log('Extracted tickets data:', ticketsData);
    
    return NextResponse.json(ticketsData);
  } catch (error) {
    console.error('Error in tickets route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 