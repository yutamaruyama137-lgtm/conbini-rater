'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { getPlaceholderImageUrl } from '@/lib/image-utils';

type ProductImageProps = {
  imageUrl: string | null;
  titleJa: string;
  titleEn?: string | null;
  chain?: string;
};

export function ProductImage({ imageUrl, titleJa, titleEn, chain }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const displayUrl = imageUrl || getPlaceholderImageUrl(titleJa, chain);

  return (
    <div className="aspect-square relative bg-gray-100">
      {!imageError ? (
        <Image
          src={displayUrl}
          alt={titleEn || titleJa}
          fill
          className="object-cover"
          unoptimized
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500">
          <Package className="w-16 h-16 mb-2" />
          <p className="text-sm font-medium">{chain || 'Product'}</p>
          <p className="text-xs mt-1 text-center px-4">{titleJa}</p>
        </div>
      )}
    </div>
  );
}

