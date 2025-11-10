'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';

const chains = ['All', 'Seven', 'FamilyMart', 'Lawson', 'MiniStop', 'NewDays'];
const categories = ['All', 'Ready Meals', 'Snacks', 'Beverages', 'Desserts', 'Rice Balls', 'Fried Foods'];

export default function ExplorePage() {
  const [selectedChain, setSelectedChain] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTab, setSelectedTab] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const filter = selectedTab === 'new' ? 'new' : selectedTab === 'popular' ? 'popular' : 'all';
        const params = new URLSearchParams({ filter });
        if (selectedChain !== 'All') {
          params.append('chain', selectedChain);
        }
        if (selectedCategory !== 'All') {
          params.append('category', selectedCategory);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedTab, selectedChain, selectedCategory]);

  const filteredProducts = products.filter((product) => {
    const chainMatch = selectedChain === 'All' || product.chains?.includes(selectedChain);
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    return chainMatch && categoryMatch;
  });

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold mb-3">Explore</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
      </header>

      <div className="p-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">CHAINS</p>
            <div className="flex flex-wrap gap-2">
              {chains.map((chain) => (
                <Badge
                  key={chain}
                  variant={selectedChain === chain ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedChain(chain)}
                >
                  {chain}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">CATEGORIES</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <TabsContent value="all" className="mt-4 space-y-3">
            {loading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>商品が見つかりませんでした</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.barcode} product={product} />
              ))
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-4 space-y-3">
            {loading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>新着商品が見つかりませんでした</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.barcode} product={product} />
              ))
            )}
          </TabsContent>

          <TabsContent value="popular" className="mt-4 space-y-3">
            {loading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>人気商品が見つかりませんでした</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.barcode} product={product} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
