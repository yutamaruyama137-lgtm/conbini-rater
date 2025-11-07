import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type SectionHeaderProps = {
  title: string;
  href?: string;
  linkText?: string;
};

export function SectionHeader({ title, href, linkText = 'See All' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-600 transition-colors"
        >
          {linkText}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
