'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from './supabase';

export type ProductWithStats = {
  barcode: string;
  title_ja: string;
  title_en: string | null;
  title_zh: string | null;
  brand: string | null;
  chains: string[];
  category: string | null;
  image_url: string | null;
  pending: boolean;
  release_date: string | null;
  avg?: number;
  count?: number;
  rank?: number;
};

export async function lookupProduct(barcode: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Open Food Factsから商品情報を取得
 */
export async function lookupFromOpenFoodFacts(barcode: string) {
  try {
    const { lookupFromProviders } = await import('@/services/barcodeProviders');
    return await lookupFromProviders(barcode);
  } catch (error) {
    console.error('Open Food Facts lookup error:', error);
    return null;
  }
}

export async function listProducts(filters?: {
  sort?: 'new' | 'top' | 'popular';
  chains?: string[];
  category?: string;
  onlyNew?: boolean;
}) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('hidden', false)
    .eq('pending', false);

  if (filters?.chains && filters.chains.length > 0) {
    query = query.overlaps('chains', filters.chains);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.onlyNew) {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    query = query.gte('release_date', twoWeeksAgo.toISOString());
  }

  if (filters?.sort === 'new') {
    query = query.order('release_date', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: products, error } = await query.limit(50);
  if (error) throw error;

  const productsWithStats: ProductWithStats[] = await Promise.all(
    (products || []).map(async (product) => {
      const { data: ratings } = await supabase
        .from('ratings')
        .select('score')
        .eq('barcode', product.barcode);

      if (!ratings || ratings.length === 0) {
        return { ...product, avg: 0, count: 0 };
      }

      const sum = ratings.reduce((acc, r) => acc + r.score, 0);
      const avg = sum / ratings.length;

      return { ...product, avg, count: ratings.length };
    })
  );

  if (filters?.sort === 'top' || filters?.sort === 'popular') {
    productsWithStats.sort((a, b) => {
      if (filters.sort === 'popular') {
        return (b.count || 0) - (a.count || 0);
      }
      return (b.avg || 0) - (a.avg || 0);
    });
  }

  return { items: productsWithStats };
}

/**
 * 検証を追加
 */
export async function submitVerification(formData: FormData) {
  const barcode = formData.get('barcode') as string;
  const verdict = formData.get('verdict') as string; // 'match' or 'mismatch'
  const userId = formData.get('user_id') as string || 'anonymous';

  if (!barcode || !verdict || (verdict !== 'match' && verdict !== 'mismatch')) {
    return { success: false, error: '無効なリクエストです' };
  }

  // 既に検証しているかチェック
  const { data: existing } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', userId)
    .eq('barcode', barcode)
    .maybeSingle();

  if (existing) {
    return { success: false, error: '既に検証済みです' };
  }

  // 検証を追加
  const { error } = await supabase.from('verifications').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    barcode,
    verdict,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // 検証状況を確認して商品のpending状態を更新
  const { data: verifications } = await supabase
    .from('verifications')
    .select('*')
    .eq('barcode', barcode)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // 24時間以内

  if (verifications) {
    const matchCount = verifications.filter((v) => v.verdict === 'match').length;
    const mismatchCount = verifications.filter((v) => v.verdict === 'mismatch').length;

    // Match≥3 && Mismatch<3で確定
    if (matchCount >= 3 && mismatchCount < 3) {
      await supabase
        .from('products')
        .update({ pending: false })
        .eq('barcode', barcode);
    }
    // Mismatch≥3で一時非表示
    else if (mismatchCount >= 3) {
      await supabase
        .from('products')
        .update({ hidden: true })
        .eq('barcode', barcode);
    }
  }

  // ポイント付与（先着3名のみ）
  try {
    const { rewardVerification } = await import('@/lib/rewards');
    await rewardVerification(userId, barcode);
  } catch (error) {
    console.error('ポイント付与エラー:', error);
  }

  revalidatePath(`/product/${barcode}`);
  return { success: true };
}

/**
 * 検証状況を取得
 */
export async function getVerificationStatus(barcode: string) {
  const { data: verifications } = await supabase
    .from('verifications')
    .select('*')
    .eq('barcode', barcode)
    .order('created_at', { ascending: false });

  if (!verifications) {
    return {
      matchCount: 0,
      mismatchCount: 0,
      totalCount: 0,
      userVerdict: null,
    };
  }

  const matchCount = verifications.filter((v) => v.verdict === 'match').length;
  const mismatchCount = verifications.filter((v) => v.verdict === 'mismatch').length;

  return {
    matchCount,
    mismatchCount,
    totalCount: verifications.length,
    verifications,
  };
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
