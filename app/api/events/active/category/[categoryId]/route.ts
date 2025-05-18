import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const response = await fetch(`https://blue-penguin-872241.hostingersite.com/api/events/active/category/${params.categoryId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch active events by category');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching active events by category:', error);
    return NextResponse.json({ error: 'Failed to fetch active events by category' }, { status: 500 });
  }
} 