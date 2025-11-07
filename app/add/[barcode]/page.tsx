'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addProduct, lookupFromOpenFoodFacts } from '@/lib/actions';

const chains = ['Seven', 'FamilyMart', 'Lawson', 'MiniStop', 'NewDays', 'Other'];
const categories = ['Ready Meals', 'Snacks', 'Beverages', 'Desserts', 'Rice Balls', 'Fried Foods', 'Other'];

export default function AddProductPage({ params }: { params: { barcode: string } }) {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingOpenFoodFacts, setLoadingOpenFoodFacts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック（1MB以下）
      if (file.size > 1024 * 1024) {
        alert('画像サイズは1MB以下にしてください');
        return;
      }
      // 画像形式チェック
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Food Factsから商品情報を自動取得
  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        const productInfo = await lookupFromOpenFoodFacts(params.barcode);
        if (productInfo && formRef.current) {
          // フォームに自動入力
          const titleJaInput = formRef.current.querySelector<HTMLInputElement>('[name="title_ja"]');
          const titleEnInput = formRef.current.querySelector<HTMLInputElement>('[name="title_en"]');
          const brandInput = formRef.current.querySelector<HTMLInputElement>('[name="brand"]');
          const categorySelect = formRef.current.querySelector<HTMLSelectElement>('[name="category"]');

          if (titleJaInput && productInfo.title_ja) {
            titleJaInput.value = productInfo.title_ja;
          }
          if (titleEnInput && productInfo.title_en) {
            titleEnInput.value = productInfo.title_en;
          }
          if (brandInput && productInfo.brand) {
            brandInput.value = productInfo.brand;
          }
          if (categorySelect && productInfo.category) {
            categorySelect.value = productInfo.category;
          }

          // 画像URLがある場合は表示
          if (productInfo.image_url) {
            setImagePreview(productInfo.image_url);
          }
        }
      } catch (error) {
        console.error('Open Food Facts lookup error:', error);
      } finally {
        setLoadingOpenFoodFacts(false);
      }
    };

    fetchProductInfo();
  }, [params.barcode]);

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    
    if (image) {
      formData.append('image', image);
    }

    try {
      const result = await addProduct(formData);
      if (result.success) {
        router.push(`/product/${params.barcode}`);
      } else {
        alert(result.error || '商品の追加に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/scan">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold flex-1">商品を追加</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <Card className="p-4">
          {loadingOpenFoodFacts && (
            <div className="flex items-center justify-center py-4 mb-4">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm text-gray-600">商品情報を取得中...</span>
            </div>
          )}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="barcode" value={params.barcode} />

            {/* 写真アップロード */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                商品写真 <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {imagePreview ? (
                  <div className="relative aspect-square max-w-xs mx-auto">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">写真をタップして選択</p>
                    <p className="text-xs text-gray-400 mt-1">1MB以下推奨</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </div>
            </div>

            {/* 商品名（日本語） */}
            <div>
              <Label htmlFor="title_ja" className="text-sm font-medium mb-2 block">
                商品名（日本語） <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title_ja"
                name="title_ja"
                placeholder="例: おにぎり 梅"
                required
              />
            </div>

            {/* 商品名（英語） */}
            <div>
              <Label htmlFor="title_en" className="text-sm font-medium mb-2 block">
                商品名（英語）
              </Label>
              <Input
                id="title_en"
                name="title_en"
                placeholder="例: Rice Ball with Pickled Plum"
              />
            </div>

            {/* ブランド */}
            <div>
              <Label htmlFor="brand" className="text-sm font-medium mb-2 block">
                ブランド
              </Label>
              <Input
                id="brand"
                name="brand"
                placeholder="例: セブンプレミアム"
              />
            </div>

            {/* チェーン */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                チェーン <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {chains.map((chain) => (
                  <label key={chain} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="chains"
                      value={chain}
                      className="rounded"
                    />
                    <span className="text-sm">{chain}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* カテゴリ */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                カテゴリ
              </Label>
              <select
                id="category"
                name="category"
                className="w-full p-2 border rounded-md"
              >
                <option value="">選択してください</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* 発売日 */}
            <div>
              <Label htmlFor="release_date" className="text-sm font-medium mb-2 block">
                発売日
              </Label>
              <Input
                id="release_date"
                name="release_date"
                type="date"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={uploading || !image}
            >
              {uploading ? 'アップロード中...' : '商品を追加'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

