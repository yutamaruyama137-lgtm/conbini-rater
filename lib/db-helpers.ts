import { supabase, Product, Rating } from './supabase';

export async function getProducts(limit?: number) {
  const query = supabase
    .from('products')
    .select('*')
    .eq('hidden', false)
    .order('created_at', { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

export async function getProductByBarcode(barcode: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .maybeSingle();

  if (error) throw error;
  return data as Product | null;
}

export async function getNewProducts(daysThreshold = 14, limit = 10) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('hidden', false)
    .gte('release_date', thresholdDate.toISOString())
    .order('release_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}

export async function getRatingsByBarcode(barcode: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('barcode', barcode)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Rating[];
}

export async function getAverageRating(barcode: string): Promise<{ avg: number; count: number }> {
  const ratings = await getRatingsByBarcode(barcode);
  if (ratings.length === 0) return { avg: 0, count: 0 };

  const sum = ratings.reduce((acc, r) => acc + r.score, 0);
  return { avg: sum / ratings.length, count: ratings.length };
}

export async function getTopRatedProducts(limit = 10) {
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*')
    .eq('hidden', false);

  if (prodError) throw prodError;
  if (!products) return [];

  const productsWithRatings = await Promise.all(
    products.map(async (product) => {
      const { avg, count } = await getAverageRating(product.barcode);
      return { ...product, avg, count };
    })
  );

  return productsWithRatings
    .filter(p => p.count > 0)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, limit);
}

export async function getProductsByChain(chain: string, limit?: number) {
  const query = supabase
    .from('products')
    .select('*')
    .eq('hidden', false)
    .contains('chains', [chain])
    .order('created_at', { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

export async function getProductsByCategory(category: string, limit?: number) {
  const query = supabase
    .from('products')
    .select('*')
    .eq('hidden', false)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

export async function getCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getWallet(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function isNewProduct(releaseDate: string | null, daysThreshold = 14): boolean {
  if (!releaseDate) return false;
  const release = new Date(releaseDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold;
}
