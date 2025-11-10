'use server';

import { revalidatePath } from 'next/cache';
import { supabase, Product } from './supabase';
import { getProductByBarcode, getRatingsByBarcode, getAverageRating } from './db-helpers';
import { DEMO_PRODUCTS } from './demo-products';

export type ProductWithStats = Product & {
  avgRating?: number;
  ratingCount?: number;
};

export async function lookupProduct(barcode: string): Promise<ProductWithStats | null> {
  const product = await getProductByBarcode(barcode);
  if (!product) return null;

  const { avg, count } = await getAverageRating(barcode);
  return {
    ...product,
    avgRating: avg,
    ratingCount: count,
  };
}

export async function lookupFromOpenFoodFacts(barcode: string) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      return {
        title_ja: product.product_name_ja || product.product_name || '',
        title_en: product.product_name_en || product.product_name || '',
        brand: product.brands || '',
        category: product.categories || '',
        image_url: product.image_url || null,
      };
    }
    return null;
  } catch (error) {
    console.error('Open Food Facts lookup error:', error);
    return null;
  }
}

export async function submitRating(formData: FormData) {
  const barcode = formData.get('barcode') as string;
  const score = parseInt(formData.get('score') as string);
  const comment = formData.get('comment') as string;
  const tags = formData.get('tags') as string;

  if (!barcode || !score) {
    return { success: false, error: 'Missing required fields' };
  }

  const ratingId = crypto.randomUUID();

  const { error } = await supabase.from('ratings').insert({
    id: ratingId,
    barcode,
    user_id: 'anonymous',
    score,
    comment: comment || null,
    tags: tags ? tags.split(',') : [],
    created_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // ポイント付与
  try {
    const { rewardRating } = await import('@/lib/rewards');
    const userId = 'anonymous'; // TODO: 認証実装時に変更
    await rewardRating(userId, barcode);
  } catch (error) {
    console.error('ポイント付与エラー:', error);
  }

  revalidatePath(`/product/${barcode}`);
  revalidatePath('/explore');

  return { success: true };
}

export async function addProduct(formData: FormData) {
  const barcode = formData.get('barcode') as string;
  const title_ja = formData.get('title_ja') as string;
  const title_en = formData.get('title_en') as string;
  const brand = formData.get('brand') as string;
  const chains = formData.getAll('chains') as string[];
  const category = formData.get('category') as string;
  const release_date = formData.get('release_date') as string;
  const image = formData.get('image') as File | null;

  if (!barcode || !title_ja || chains.length === 0) {
    return { success: false, error: '必須項目が不足しています' };
  }

  // 画像のアップロード処理（Supabase Storage）
  let image_url: string | null = null;
  if (image && image.size > 0) {
    try {
      const { uploadImage } = await import('@/services/imageUpload');
      const result = await uploadImage(image, barcode);
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      image_url = result.url;
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      return { success: false, error: '画像のアップロードに失敗しました' };
    }
  }

  // 重複チェック
  const { data: existing } = await supabase
    .from('products')
    .select('barcode')
    .eq('barcode', barcode)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'このバーコードの商品は既に登録されています' };
  }

  // 商品を追加（pending=trueで保存）
  const { error } = await supabase.from('products').insert({
    barcode,
    title_ja,
    title_en: title_en || null,
    title_zh: null,
    brand: brand || null,
    chains,
    category: category || null,
    image_url,
    pending: true,
    created_by: 'anonymous',
    release_date: release_date || null,
    created_at: new Date().toISOString(),
    hidden: false,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // ポイント付与
  try {
    const { rewardProductAddition } = await import('@/lib/rewards');
    const userId = 'anonymous'; // TODO: 認証実装時に変更
    await rewardProductAddition(userId, barcode);
  } catch (error) {
    console.error('ポイント付与エラー:', error);
  }

  revalidatePath(`/product/${barcode}`);
  revalidatePath('/explore');

  return { success: true };
}

export async function submitVerification(formData: FormData) {
  const barcode = formData.get('barcode') as string;
  const verdict = formData.get('verdict') as string;

  if (!barcode || !verdict) {
    return { success: false, error: 'Missing required fields' };
  }

  const verificationId = crypto.randomUUID();

  const { error } = await supabase.from('verifications').insert({
    id: verificationId,
    barcode,
    user_id: 'anonymous',
    verdict,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // ポイント付与
  try {
    const { rewardVerification } = await import('@/lib/rewards');
    const userId = 'anonymous'; // TODO: 認証実装時に変更
    await rewardVerification(userId, barcode);
  } catch (error) {
    console.error('ポイント付与エラー:', error);
  }

  revalidatePath(`/product/${barcode}`);
  revalidatePath('/explore');

  return { success: true };
}

export async function getVerificationStatus(barcode: string) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('barcode', barcode)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, verifications: data || [] };
}

/**
 * デモ商品をデータベースに追加
 */
export async function seedDemoProducts() {
  const results = [];
  
  for (const product of DEMO_PRODUCTS) {
    // 既存チェック
    const { data: existing } = await supabase
      .from('products')
      .select('barcode')
      .eq('barcode', product.barcode)
      .maybeSingle();

    if (existing) {
      // 既に存在する場合はスキップ
      results.push({ barcode: product.barcode, status: 'skipped' });
      continue;
    }

    // 商品を追加（pending=falseで承認済みとして追加）
    const { error } = await supabase.from('products').insert({
      barcode: product.barcode,
      title_ja: product.title_ja,
      title_en: product.title_en,
      title_zh: null,
      brand: product.brand,
      chains: product.chains,
      category: product.category,
      image_url: product.image_url || null,
      pending: false, // デモ商品は承認済み
      created_by: 'system',
      release_date: product.release_date || null,
      created_at: new Date().toISOString(),
      hidden: false,
    });

    if (error) {
      results.push({ barcode: product.barcode, status: 'error', error: error.message });
    } else {
      results.push({ barcode: product.barcode, status: 'added' });
    }
  }

  revalidatePath('/');
  revalidatePath('/explore');
  
  return { success: true, results };
}
