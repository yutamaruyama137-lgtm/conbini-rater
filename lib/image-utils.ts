/**
 * デモ用の商品画像URLを生成する関数
 * 画像がない場合に使用するプレースホルダー画像を生成
 */

export function getProductImageUrl(
  imageUrl: string | null | undefined,
  productName: string,
  chain?: string
): string {
  // 画像URLがある場合はそのまま返す
  if (imageUrl) {
    return imageUrl;
  }

  // デモ用のプレースホルダー画像を生成
  // UnsplashのAPIを使用して商品名に基づいた画像を取得
  const searchQuery = encodeURIComponent(
    `${productName} ${chain || 'convenience store product'}`
  );
  
  // Unsplashのランダム画像APIを使用（デモ用）
  // 実際のプロダクションでは、より適切な画像サービスを使用することを推奨
  return `https://source.unsplash.com/400x400/?${searchQuery}`;
}

/**
 * 商品名とチェーン名からプレースホルダー画像のURLを生成
 */
export function getPlaceholderImageUrl(
  productName: string,
  chain?: string
): string {
  const searchQuery = encodeURIComponent(
    `${productName} ${chain || 'convenience store'} japan`
  );
  return `https://source.unsplash.com/400x400/?${searchQuery}`;
}

