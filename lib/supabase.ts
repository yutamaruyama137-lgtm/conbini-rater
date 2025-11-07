import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Product = {
  barcode: string;
  title_ja: string;
  title_en: string | null;
  title_zh: string | null;
  brand: string | null;
  chains: string[];
  category: string | null;
  image_url: string | null;
  pending: boolean;
  pb_label: string | null;
  release_date: string | null;
  created_by: string;
  created_at: string;
  hidden: boolean;
};

export type Rating = {
  id: string;
  user_id: string;
  barcode: string;
  score: number;
  comment: string | null;
  tags: any;
  created_at: string;
};

export type Coupon = {
  id: string;
  title_en: string;
  title_ja: string;
  title_zh: string;
  description: string;
  points_required: number;
  quota: number;
  expires_at: string | null;
  partner: string | null;
  created_at: string;
};

export type Wallet = {
  user_id: string;
  points: number;
  streak: number;
  last_activity: string | null;
  updated_at: string;
};
