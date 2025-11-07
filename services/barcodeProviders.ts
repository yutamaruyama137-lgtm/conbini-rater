import { Product } from '@/lib/supabase';

export interface Provider {
  lookup(barcode: string): Promise<Partial<Product> | null>;
}

class NullProvider implements Provider {
  async lookup(barcode: string): Promise<Partial<Product> | null> {
    return null;
  }
}

class OpenFoodFactsProvider implements Provider {
  async lookup(barcode: string): Promise<Partial<Product> | null> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        {
          headers: {
            'User-Agent': 'ConbiniRater/1.0 (https://github.com/yourusername/conbini-rater)',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.status === 0 || !data.product) {
        return null;
      }

      const product = data.product;

      // Open Food FactsのデータをProduct型に変換
      const result: Partial<Product> = {
        barcode: barcode,
        title_ja: product.product_name_ja || product.product_name || '',
        title_en: product.product_name_en || product.product_name || null,
        title_zh: product.product_name_zh || null,
        brand: product.brands || product.brand || null,
        chains: [], // Open Food Factsにはチェーン情報がないため空配列
        category: product.categories || product.category || null,
        image_url: product.image_url || product.image_front_url || null,
        pending: false,
        release_date: null, // Open Food Factsには発売日情報がない
      };

      return result;
    } catch (error) {
      console.error('Open Food Facts API error:', error);
      return null;
    }
  }
}

export const providerChain: Provider[] = [
  new OpenFoodFactsProvider(),
  new NullProvider(),
];

export async function lookupFromProviders(barcode: string): Promise<Partial<Product> | null> {
  for (const provider of providerChain) {
    const result = await provider.lookup(barcode);
    if (result) {
      return result;
    }
  }
  return null;
}
