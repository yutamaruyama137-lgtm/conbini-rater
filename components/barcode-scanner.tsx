'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { Camera, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

type BarcodeScannerProps = {
  onScan: (barcode: string) => void;
};

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastDetectedBarcodeRef = useRef<string | null>(null);
  const detectionCountRef = useRef<number>(0);

  useEffect(() => {
    // コンポーネントのアンマウント時にカメラを停止
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current = null;
      }
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsScanning(false);
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    setError(null);
    setIsScanning(true);

    try {
      // ZXing 初期化
      const reader = new BrowserMultiFormatReader();
      codeReaderRef.current = reader;

      // 背面カメラ優先（対応端末は 'environment' を使う）
      // 解像度を上げて精度向上
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      // 許可ダイアログ → ストリーム取得
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // iOS Safari はユーザー操作後だと安定
      }

      // 連続スキャン開始（検出時ごとにコールバック）
      reader.decodeFromVideoDevice(
        undefined, // 既定デバイス
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            // バーコードが8-14桁の数字かチェック
            if (/^\d{8,14}$/.test(text)) {
              // 精度向上: 同じバーコードを複数回検出してから確定
              if (lastDetectedBarcodeRef.current === text) {
                detectionCountRef.current += 1;
                // 3回連続で同じバーコードが検出されたら確定
                if (detectionCountRef.current >= 3) {
                  stopScanning();
                  onScan(text);
                  lastDetectedBarcodeRef.current = null;
                  detectionCountRef.current = 0;
                }
              } else {
                // 新しいバーコードが検出されたらリセット
                lastDetectedBarcodeRef.current = text;
                detectionCountRef.current = 1;
              }
            } else {
              setError('有効なバーコードを読み取れませんでした。8-14桁の数字が必要です。');
            }
          } else {
            // バーコードが検出されない場合はカウントをリセット
            if (err instanceof NotFoundException) {
              lastDetectedBarcodeRef.current = null;
              detectionCountRef.current = 0;
            }
          }
          // err は検出できないフレームで普通に発生するので握りつぶしてOK（NotFoundException以外は表示）
          if (err && !(err instanceof NotFoundException)) {
            setError(err.message || 'スキャン中にエラーが発生しました。');
          }
        }
      );
    } catch (e: any) {
      // 失敗時のエラーハンドリング
      setError(e?.message ?? 'カメラへのアクセスに失敗しました。カメラの許可を確認してください。');
      setIsScanning(false);
      
      // クリーンアップ
      if (codeReaderRef.current) {
        codeReaderRef.current = null;
      }
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current = null;
    }
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    // 検出カウントをリセット
    lastDetectedBarcodeRef.current = null;
    detectionCountRef.current = 0;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim() && /^\d{8,14}$/.test(manualBarcode.trim())) {
      stopScanning();
      onScan(manualBarcode.trim());
      setManualBarcode('');
      setShowManual(false);
    } else {
      setError('有効なバーコードを入力してください（8-14桁の数字）');
    }
  };


  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline // iOS Safari 必須
          muted       // 自動再生の安定性向上
        />
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-40 border-2 border-emerald-500 rounded-lg relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
            </div>
          </div>
        )}

        {/* 簡易ガイドライン */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 border-2 border-white/50 rounded-lg m-6" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        <Camera className="absolute top-4 left-4 w-6 h-6 text-white" />

        <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
          {isScanning ? 'バーコードをスキャン中...' : 'Point camera at barcode'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 w-full">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            <Camera className="w-4 h-4 mr-2" />
            カメラでスキャン
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="destructive"
            className="w-full"
          >
            スキャンを停止
          </Button>
        )}
      </div>

      {!showManual ? (
        <Button
          onClick={() => {
            stopScanning();
            setShowManual(true);
          }}
          variant="secondary"
          className="w-full"
        >
          手入力でバーコードを入力
        </Button>
      ) : (
        <form onSubmit={handleManualSubmit} className="w-full space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              value={manualBarcode}
              onChange={(e) => {
                setManualBarcode(e.target.value.replace(/\D/g, ''));
                setError(null);
              }}
              placeholder="バーコードを入力（8-14桁の数字）"
              className="flex-1"
              autoFocus
              maxLength={14}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowManual(false);
                setManualBarcode('');
                setError(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
            検索
          </Button>
        </form>
      )}
    </div>
  );
}
