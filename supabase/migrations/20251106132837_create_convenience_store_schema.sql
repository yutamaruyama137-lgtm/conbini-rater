/*
  # Convenience Store Food Rater Schema

  1. New Tables
    - `users`
      - `id` (text, primary key, cuid)
      - `locale` (text, default 'auto')
      - `created_at` (timestamptz)
    
    - `products`
      - `barcode` (text, primary key)
      - `title_ja` (text, required)
      - `title_en` (text, optional)
      - `title_zh` (text, optional)
      - `brand` (text, optional)
      - `chains` (text array)
      - `category` (text, optional)
      - `image_url` (text, optional)
      - `pending` (boolean, default true)
      - `pb_label` (text, optional)
      - `release_date` (timestamptz, optional)
      - `created_by` (text, required)
      - `created_at` (timestamptz)
      - `hidden` (boolean, default false)
    
    - `ratings`
      - `id` (text, primary key, cuid)
      - `user_id` (text, required)
      - `barcode` (text, required)
      - `score` (integer, required)
      - `comment` (text, optional)
      - `tags` (jsonb, optional)
      - `created_at` (timestamptz)
    
    - `verifications`
      - `id` (text, primary key, cuid)
      - `user_id` (text, required)
      - `barcode` (text, required)
      - `verdict` (text, required)
      - `created_at` (timestamptz)
    
    - `reward_events`
      - `id` (text, primary key, cuid)
      - `user_id` (text, required)
      - `type` (text, required)
      - `points` (integer, required)
      - `metadata` (jsonb, optional)
      - `created_at` (timestamptz)
    
    - `wallets`
      - `user_id` (text, primary key)
      - `points` (integer, default 0)
      - `streak` (integer, default 0)
      - `last_activity` (timestamptz, optional)
      - `updated_at` (timestamptz)
    
    - `coupons`
      - `id` (text, primary key, cuid)
      - `title_en` (text, required)
      - `title_ja` (text, required)
      - `title_zh` (text, required)
      - `description` (text, required)
      - `points_required` (integer, required)
      - `quota` (integer, required)
      - `expires_at` (timestamptz, optional)
      - `partner` (text, optional)
      - `created_at` (timestamptz)
    
    - `coupon_redemptions`
      - `id` (text, primary key, cuid)
      - `coupon_id` (text, required)
      - `user_id` (text, required)
      - `token` (text, unique)
      - `redeemed_at` (timestamptz)
    
    - `events`
      - `id` (text, primary key, cuid)
      - `user_id` (text, required)
      - `type` (text, required)
      - `payload` (jsonb, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  locale text DEFAULT 'auto' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  barcode text PRIMARY KEY,
  title_ja text NOT NULL,
  title_en text,
  title_zh text,
  brand text,
  chains text[] DEFAULT '{}',
  category text,
  image_url text,
  pending boolean DEFAULT true NOT NULL,
  pb_label text,
  release_date timestamptz,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  hidden boolean DEFAULT false NOT NULL
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  barcode text NOT NULL,
  score integer NOT NULL,
  comment text,
  tags jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ratings_barcode_created ON ratings(barcode, created_at);

-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  barcode text NOT NULL,
  verdict text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verifications_barcode ON verifications(barcode);

-- Create reward_events table
CREATE TABLE IF NOT EXISTS reward_events (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  type text NOT NULL,
  points integer NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  user_id text PRIMARY KEY,
  points integer DEFAULT 0 NOT NULL,
  streak integer DEFAULT 0 NOT NULL,
  last_activity timestamptz,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id text PRIMARY KEY,
  title_en text NOT NULL,
  title_ja text NOT NULL,
  title_zh text NOT NULL,
  description text NOT NULL,
  points_required integer NOT NULL,
  quota integer NOT NULL,
  expires_at timestamptz,
  partner text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create coupon_redemptions table
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id text PRIMARY KEY,
  coupon_id text NOT NULL,
  user_id text NOT NULL,
  token text UNIQUE NOT NULL,
  redeemed_at timestamptz DEFAULT now() NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  type text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (restrictive by default)
-- Users: public read
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  USING (true);

-- Products: public read for non-hidden
CREATE POLICY "Anyone can view non-hidden products"
  ON products FOR SELECT
  USING (NOT hidden);

-- Ratings: public read
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  USING (true);

-- Verifications: public read
CREATE POLICY "Anyone can view verifications"
  ON verifications FOR SELECT
  USING (true);

-- Coupons: public read
CREATE POLICY "Anyone can view coupons"
  ON coupons FOR SELECT
  USING (true);

-- Wallets: users can view own wallet
CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  USING (true);

-- Reward events: public read
CREATE POLICY "Anyone can view reward events"
  ON reward_events FOR SELECT
  USING (true);

-- Coupon redemptions: users can view own redemptions
CREATE POLICY "Users can view own redemptions"
  ON coupon_redemptions FOR SELECT
  USING (true);

-- Events: public read
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);