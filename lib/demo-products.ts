/**
 * デモ用の有名商品データ
 * バーコードを読み取らなくても表示される初期商品
 */

export interface DemoProduct {
  barcode: string;
  title_ja: string;
  title_en: string;
  brand: string;
  chains: string[];
  category: string;
  image_url?: string;
  release_date?: string;
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  // ファミマ商品
  {
    barcode: '4901330571481',
    title_ja: 'ファミチキ',
    title_en: 'Famichiki Fried Chicken',
    brand: 'ファミマ',
    chains: ['FamilyMart'],
    category: 'Fried Foods',
    release_date: new Date('2024-01-01').toISOString(),
  },
  {
    barcode: '4901330571482',
    title_ja: 'ファミマルコーヒー',
    title_en: 'Famima Coffee',
    brand: 'ファミマ',
    chains: ['FamilyMart'],
    category: 'Beverages',
    release_date: new Date('2024-01-01').toISOString(),
  },
  {
    barcode: '4901330571483',
    title_ja: 'ファミマルチョココロネ',
    title_en: 'Famima Chocolate Corone',
    brand: 'ファミマ',
    chains: ['FamilyMart'],
    category: 'Desserts',
    release_date: new Date('2024-01-01').toISOString(),
  },
  // セブンイレブン商品
  {
    barcode: '4901330571484',
    title_ja: 'ななチキ',
    title_en: 'Nanachiki Fried Chicken',
    brand: 'セブンプレミアム',
    chains: ['Seven'],
    category: 'Fried Foods',
    release_date: new Date('2024-01-01').toISOString(),
  },
  {
    barcode: '4901330571485',
    title_ja: 'セブンカフェ',
    title_en: 'Seven Cafe',
    brand: 'セブンイレブン',
    chains: ['Seven'],
    category: 'Beverages',
    release_date: new Date('2024-01-01').toISOString(),
  },
  {
    barcode: '4901330571486',
    title_ja: 'おにぎり ツナマヨ',
    title_en: 'Onigiri Tuna Mayo',
    brand: 'セブンプレミアム',
    chains: ['Seven'],
    category: 'Rice Balls',
    release_date: new Date('2024-01-01').toISOString(),
  },
  // ローソン商品
  {
    barcode: '4901330571487',
    title_ja: 'からあげクン レッド',
    title_en: 'Karaage-kun Red',
    brand: 'ローソン',
    chains: ['Lawson'],
    category: 'Fried Foods',
    release_date: new Date('2024-01-01').toISOString(),
  },
  {
    barcode: '4901330571488',
    title_ja: 'ローソン プレミアムロールケーキ',
    title_en: 'Lawson Premium Roll Cake',
    brand: 'ローソン',
    chains: ['Lawson'],
    category: 'Desserts',
    release_date: new Date('2024-01-01').toISOString(),
  },
  {
    barcode: '4901330571489',
    title_ja: 'からあげクン グリーン',
    title_en: 'Karaage-kun Green',
    brand: 'ローソン',
    chains: ['Lawson'],
    category: 'Fried Foods',
    release_date: new Date('2024-01-01').toISOString(),
  },
  // ミニストップ商品
  {
    barcode: '4901330571490',
    title_ja: 'ミニストップ からあげ',
    title_en: 'MiniStop Karaage',
    brand: 'ミニストップ',
    chains: ['MiniStop'],
    category: 'Fried Foods',
    release_date: new Date('2024-01-01').toISOString(),
  },
  {
    barcode: '4901330571491',
    title_ja: 'ミニストップ おにぎり',
    title_en: 'MiniStop Onigiri',
    brand: 'ミニストップ',
    chains: ['MiniStop'],
    category: 'Rice Balls',
    release_date: new Date('2024-01-01').toISOString(),
  },
];






