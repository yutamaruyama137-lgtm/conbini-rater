import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/supabase';
import { isNewProduct } from '@/lib/db-helpers';

type ProductCardProps = {
  product: Product;
  avgRating?: number;
  ratingCount?: number;
};

const chainColors: Record<string, string> = {
  Seven: 'bg-red-500',
  FamilyMart: 'bg-green-600',
  Lawson: 'bg-blue-600',
  MiniStop: 'bg-purple-600',
  NewDays: 'bg-orange-600',
  Other: 'bg-gray-500'
};

export function ProductCard({ product, avgRating = 0, ratingCount = 0 }: ProductCardProps) {
  const isNew = isNewProduct(product.release_date);

  return (
    <Link href={`/product/${product.barcode}`}>
      <Card className="flex gap-3 p-3 hover:shadow-md transition-shadow">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.title_ja}
              fill
              className="object-cover"
            />
          )}
          {isNew && (
            <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-rose-500">
              NEW
            </Badge>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
              {product.title_ja}
            </h3>
            {product.title_en && (
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                {product.title_en}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {product.chains.map((chain) => (
              <Badge
                key={chain}
                variant="secondary"
                className={`text-[10px] px-1.5 py-0 h-4 text-white ${chainColors[chain] || chainColors.Other}`}
              >
                {chain}
              </Badge>
            ))}
          </div>

          {avgRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({ratingCount})</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
