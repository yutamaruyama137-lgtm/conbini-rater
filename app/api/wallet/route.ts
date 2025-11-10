import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateWallet } from '@/lib/rewards';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'anonymous';

    const wallet = await getOrCreateWallet(userId);
    return NextResponse.json(wallet);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}






