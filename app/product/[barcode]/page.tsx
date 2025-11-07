import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RatingStars } from '@/components/rating-stars';
import { getProductByBarcode, getRatingsByBarcode, getAverageRating } from '@/lib/db-helpers';
import { submitRating } from '@/lib/actions';

export const dynamic = 'force-dynamic';

const chainColors: Record<string, string> = {
  Seven: 'bg-red-500',
  FamilyMart: 'bg-green-600',
  Lawson: 'bg-blue-600',
  MiniStop: 'bg-purple-600',
  NewDays: 'bg-orange-600',
  Other: 'bg-gray-500'
};

export default async function ProductPage({ params }: { params: { barcode: string } }) {
  const product = await getProductByBarcode(params.barcode);

  if (!product) {
    // 商品が見つからない場合は追加フォームへリダイレクト
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-4 text-center">
          <p className="text-gray-600 mb-4">商品が見つかりませんでした</p>
          <Link href={`/add/${params.barcode}`}>
            <Button>商品を追加する</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (product.pending) {
    // pending商品の場合は追加フォームへリダイレクト
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-4 text-center">
          <p className="text-gray-600 mb-4">この商品は承認待ちです</p>
          <Link href={`/add/${params.barcode}`}>
            <Button>商品情報を確認・編集</Button>
          </Link>
        </div>
      </div>
    );
  }

  const ratings = await getRatingsByBarcode(params.barcode);
  const { avg, count } = await getAverageRating(params.barcode);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/explore">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold flex-1">Product Details</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        <Card className="overflow-hidden">
          <div className="aspect-square relative bg-gray-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.title_en || product.title_ja}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h2 className="text-xl font-bold">{product.title_ja}</h2>
              {product.title_en && (
                <p className="text-sm text-gray-600">{product.title_en}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <RatingStars rating={avg} />
              <span className="text-sm text-gray-600">
                {avg.toFixed(1)} ({count} ratings)
              </span>
            </div>

            {product.brand && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Brand:</span>
                <Badge variant="secondary">{product.brand}</Badge>
              </div>
            )}

            {product.chains && product.chains.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.chains.map((chain) => (
                  <Badge
                    key={chain}
                    className={`${chainColors[chain] || chainColors.Other} text-white`}
                  >
                    {chain}
                  </Badge>
                ))}
              </div>
            )}

            {product.category && (
              <Badge variant="outline">{product.category}</Badge>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Rate this product</h3>
          <form action={submitRating} className="space-y-3">
            <input type="hidden" name="barcode" value={params.barcode} />

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Rating</label>
              <select name="score" required className="w-full p-2 border rounded">
                <option value="">Select rating</option>
                <option value="5">★★★★★ Excellent</option>
                <option value="4">★★★★☆ Good</option>
                <option value="3">★★★☆☆ Average</option>
                <option value="2">★★☆☆☆ Below Average</option>
                <option value="1">★☆☆☆☆ Poor</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Comment (optional)</label>
              <textarea
                name="comment"
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Share your thoughts..."
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Rating
            </Button>
          </form>
        </Card>

        {ratings.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Recent Ratings</h3>
            <div className="space-y-3">
              {ratings.slice(0, 10).map((rating) => (
                <div key={rating.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <RatingStars rating={rating.score} size="sm" />
                    <span className="text-xs text-gray-500">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-sm text-gray-700">{rating.comment}</p>
                  )}
                  {rating.tags && rating.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rating.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
