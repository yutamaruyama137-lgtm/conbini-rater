'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { seedDemoProducts } from '@/lib/actions';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await seedDemoProducts();
      setResult(response);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-50 p-4">
      <Card>
        <CardHeader>
          <CardTitle>デモ商品の追加</CardTitle>
          <CardDescription>
            有名商品（ファミチキ、ななチキなど）をデータベースに追加します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSeed}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                追加中...
              </>
            ) : (
              'デモ商品を追加'
            )}
          </Button>

          {result && (
            <div className="space-y-2">
              {result.success ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>デモ商品の追加が完了しました</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span>エラー: {result.error}</span>
                </div>
              )}

              {result.results && (
                <div className="text-sm space-y-1">
                  <p className="font-medium">結果:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {result.results.map((r: any, i: number) => (
                      <li key={i}>
                        {r.barcode}: {r.status === 'added' ? '追加済み' : r.status === 'skipped' ? 'スキップ' : 'エラー'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}






