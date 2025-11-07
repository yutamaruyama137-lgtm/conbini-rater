'use server';

import { supabase } from './supabase';
import { nanoid } from 'nanoid';

// nanoidが利用できない場合はcrypto.randomUUIDを使用
const generateId = () => {
  if (typeof nanoid === 'function') {
    return nanoid();
  }
  return crypto.randomUUID();
};

const VERIFICATION_REWARD_POINTS = 3;
const VERIFICATION_REWARD_LIMIT = 3; // 先着3名
const ADD_PRODUCT_POINTS = 20;
const RATING_POINTS = 3;
const STREAK_BONUSES = {
  3: 10,
  7: 20,
  14: 40,
};

/**
 * ウォレットを取得または作成
 */
export async function getOrCreateWallet(userId: string) {
  const { data: existing } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  // ウォレットが存在しない場合は作成
  const { data, error } = await supabase
    .from('wallets')
    .insert({
      user_id: userId,
      points: 0,
      streak: 0,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * ポイントを付与
 */
export async function addPoints(
  userId: string,
  points: number,
  type: string,
  metadata?: Record<string, any>
) {
  const wallet = await getOrCreateWallet(userId);

  // 報酬イベントを記録
  await supabase.from('reward_events').insert({
    id: generateId(),
    user_id: userId,
    type,
    points,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
  });

  // ウォレットを更新
  const { error } = await supabase
    .from('wallets')
    .update({
      points: wallet.points + points,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) throw error;
  return wallet.points + points;
}

/**
 * 連続日数ボーナスを計算
 */
export async function calculateStreakBonus(userId: string): Promise<number> {
  const wallet = await getOrCreateWallet(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = wallet.last_activity
    ? new Date(wallet.last_activity)
    : null;

  if (!lastActivity) {
    // 初回アクティビティ
    await supabase
      .from('wallets')
      .update({
        streak: 1,
        last_activity: today.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    return 0;
  }

  lastActivity.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // 今日既にアクティビティがある
    return 0;
  } else if (daysDiff === 1) {
    // 連続日数を更新
    const newStreak = wallet.streak + 1;
    await supabase
      .from('wallets')
      .update({
        streak: newStreak,
        last_activity: today.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // ボーナスポイントを計算
    const bonus = STREAK_BONUSES[newStreak as keyof typeof STREAK_BONUSES] || 0;
    if (bonus > 0) {
      await addPoints(userId, bonus, 'streak_bonus', { streak: newStreak });
    }
    return bonus;
  } else {
    // 連続が途切れた
    await supabase
      .from('wallets')
      .update({
        streak: 1,
        last_activity: today.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    return 0;
  }
}

/**
 * 商品追加時のポイント付与
 */
export async function rewardProductAddition(userId: string, barcode: string) {
  await addPoints(userId, ADD_PRODUCT_POINTS, 'product_addition', { barcode });
  await calculateStreakBonus(userId);
}

/**
 * 評価時のポイント付与
 */
export async function rewardRating(userId: string, barcode: string) {
  // 同じ商品・同じユーザーで今日既に評価しているかチェック
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: existing } = await supabase
    .from('reward_events')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'rating')
    .eq('metadata->>barcode', barcode)
    .gte('created_at', today.toISOString())
    .maybeSingle();

  if (existing) {
    // 今日既に評価している場合はポイント付与しない
    return;
  }

  await addPoints(userId, RATING_POINTS, 'rating', { barcode });
  await calculateStreakBonus(userId);
}

/**
 * 検証時のポイント付与（先着3名のみ）
 */
export async function rewardVerification(userId: string, barcode: string) {
  // 既に検証しているかチェック
  const { data: existing } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', userId)
    .eq('barcode', barcode)
    .maybeSingle();

  if (existing) {
    // 既に検証している場合はポイント付与しない
    return;
  }

  // この商品の検証報酬を受け取った人数を確認
  const { data: rewards } = await supabase
    .from('reward_events')
    .select('*')
    .eq('type', 'verification')
    .eq('metadata->>barcode', barcode);

  if (rewards && rewards.length < VERIFICATION_REWARD_LIMIT) {
    await addPoints(userId, VERIFICATION_REWARD_POINTS, 'verification', { barcode });
    await calculateStreakBonus(userId);
  }
}

