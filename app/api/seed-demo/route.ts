import { NextRequest, NextResponse } from 'next/server';
import { seedDemoProducts } from '@/lib/actions';

export async function POST(request: NextRequest) {
  try {
    const result = await seedDemoProducts();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed demo products' },
      { status: 500 }
    );
  }
}






