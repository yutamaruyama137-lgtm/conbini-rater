import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getNewProducts, getTopRatedProducts } from '@/lib/db-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const chain = searchParams.get('chain');
    const category = searchParams.get('category');

    let products;

    if (filter === 'new') {
      products = await getNewProducts(14, 100);
    } else if (filter === 'popular') {
      products = await getTopRatedProducts(100);
    } else {
      products = await getProducts(100);
    }

    // チェーンでフィルタリング
    if (chain && chain !== 'All') {
      products = products.filter((p) => p.chains.includes(chain));
    }

    // カテゴリでフィルタリング
    if (category && category !== 'All') {
      products = products.filter((p) => p.category === category);
    }

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

