'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Gift, TrendingUp, Zap, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Wallet = {
  user_id: string;
  points: number;
  streak: number;
  last_activity: string | null;
  updated_at: string;
};

type RewardEvent = {
  id: string;
  user_id: string;
  type: string;
  points: number;
  metadata: any;
  created_at: string;
};

export default function RewardsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recentEvents, setRecentEvents] = useState<RewardEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const userId = 'anonymous'; // TODO: 認証実装時に変更

      // ウォレット情報を取得
      try {
        const { getOrCreateWallet } = await import('@/lib/rewards');
        const walletData = await getOrCreateWallet(userId);
        setWallet(walletData);
      } catch (error) {
        console.error('Failed to load wallet:', error);
      }

      // 最近の報酬イベントを取得
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase
          .from('reward_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setRecentEvents(data);
        }
      } catch (error) {
        console.error('Failed to load reward events:', error);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      product_addition: '商品追加',
      rating: '評価',
      verification: '検証',
      streak_bonus: '連続日数ボーナス',
    };
    return labels[type] || type;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'product_addition':
        return <Gift className="w-4 h-4" />;
      case 'rating':
        return <Star className="w-4 h-4" />;
      case 'verification':
        return <Award className="w-4 h-4" />;
      case 'streak_bonus':
        return <Zap className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold">Rewards</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* ウォレット情報 */}
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              ポイント
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-12 w-32 bg-white/20" />
            ) : (
              <div className="space-y-2">
                <div className="text-4xl font-bold">
                  {wallet?.points || 0}
                  <span className="text-2xl ml-2">pt</span>
                </div>
                {wallet && wallet.streak > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>連続 {wallet.streak} 日</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ポイント獲得方法 */}
        <Card>
          <CardHeader>
            <CardTitle>ポイント獲得方法</CardTitle>
            <CardDescription>アクションを実行してポイントを獲得しよう！</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-medium">商品追加</p>
                  <p className="text-sm text-gray-500">新しい商品を追加</p>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white">+20pt</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium">評価</p>
                  <p className="text-sm text-gray-500">商品を評価</p>
                </div>
              </div>
              <Badge className="bg-amber-500 text-white">+3pt</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">検証</p>
                  <p className="text-sm text-gray-500">商品情報を検証（先着3名）</p>
                </div>
              </div>
              <Badge className="bg-blue-500 text-white">+3pt</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">連続日数ボーナス</p>
                  <p className="text-sm text-gray-500">3日: +10pt, 7日: +20pt, 14日: +40pt</p>
                </div>
              </div>
              <Badge className="bg-purple-500 text-white">ボーナス</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 最近の報酬イベント */}
        <Card>
          <CardHeader>
            <CardTitle>最近の獲得履歴</CardTitle>
            <CardDescription>最近獲得したポイントの履歴</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>まだポイントを獲得していません</p>
                <p className="text-sm mt-1">商品をスキャンして評価してみましょう！</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <p className="font-medium">{getEventTypeLabel(event.type)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500 text-white">+{event.points}pt</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* リフレッシュボタン */}
        <Button
          onClick={loadWalletData}
          className="w-full"
          variant="outline"
          disabled={loading}
        >
          {loading ? '読み込み中...' : '更新'}
        </Button>
      </div>
    </main>
  );
}

