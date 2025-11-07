'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { lookupProduct } from '@/lib/actions';

export default function ScanPage() {
  const router = useRouter();

  const handleScan = async (barcode: string) => {
    try {
      const product = await lookupProduct(barcode);
      if (product && !product.pending) {
        // 商品が見つかり、承認済みの場合
        router.push(`/product/${barcode}`);
      } else {
        // 商品が見つからない、またはpendingの場合
        router.push(`/add/${barcode}`);
      }
    } catch (error) {
      // エラーが発生した場合も追加フォームへ
      router.push(`/add/${barcode}`);
    }
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Scan Product</h1>
      </header>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4 text-center">
          Point camera at barcode or enter manually
        </p>
        <BarcodeScanner onScan={handleScan} />
      </div>
    </main>
  );
}
