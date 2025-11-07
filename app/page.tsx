import { Suspense } from 'react';
import Link from 'next/link';
import { ScanLine, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { SectionHeader } from '@/components/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { LangSwitch } from '@/components/lang-switch';
import { getNewProducts, getTopRatedProducts } from '@/lib/db-helpers';

async function NewArrivals() {
  const products = await getNewProducts(14, 5);

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex gap-3 pb-2">
        {products.map((product) => (
          <div key={product.barcode} className="w-72 flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

async function TopThisWeek() {
  const products = await getTopRatedProducts(6);

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.barcode}
          product={product}
          avgRating={product.avg}
          ratingCount={product.count}
        />
      ))}
    </div>
  );
}

export default async function HomePage() {
  return (
    <main className="max-w-md mx-auto">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-semibold">Conbini Rater</h1>
          </div>
          <LangSwitch />
        </div>
      </header>

      <div className="p-4 space-y-6">
        <section>
          <SectionHeader title="New Arrivals" href="/explore?filter=new" />
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <NewArrivals />
          </Suspense>
        </section>

        <section>
          <SectionHeader title="Top This Week" href="/explore?filter=top" />
          <Suspense fallback={<div className="grid grid-cols-2 gap-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>}>
            <TopThisWeek />
          </Suspense>
        </section>
      </div>

      <Link href="/scan" className="fixed bottom-20 right-4 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-emerald-500 hover:bg-emerald-600"
          aria-label="Scan product"
        >
          <ScanLine className="w-6 h-6" />
        </Button>
      </Link>
    </main>
  );
}
