import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'product-images';

/**
 * 画像をSupabase Storageにアップロード
 */
export async function uploadImage(
  file: File,
  barcode: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // ファイル名を生成（barcode-timestamp.extension）
    const fileExt = file.name.split('.').pop();
    const fileName = `${barcode}-${Date.now()}.${fileExt}`;
    const filePath = `${barcode}/${fileName}`;

    // 画像をリサイズ・圧縮（クライアント側で処理する場合は別途実装）
    // 今回はそのままアップロード

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('画像アップロードエラー:', error);
      return { url: null, error: error.message };
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : '画像のアップロードに失敗しました',
    };
  }
}

/**
 * 画像を削除
 */
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // URLからファイルパスを抽出
    const urlParts = imageUrl.split('/');
    const filePath = urlParts.slice(-2).join('/'); // barcode/filename

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error('画像削除エラー:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('画像削除エラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '画像の削除に失敗しました',
    };
  }
}

