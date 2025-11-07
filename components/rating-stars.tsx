import { Star } from 'lucide-react';

type RatingStarsProps = {
  rating: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};

export function RatingStars({ rating, readonly = true, size = 'md' }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= fullStars;
        const isHalf = star === fullStars + 1 && hasHalfStar;

        return (
          <div key={star} className="relative">
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} />
              </div>
            )}
          </div>
        );
      })}
      {readonly && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
