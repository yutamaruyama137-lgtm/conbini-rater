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
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // コンポーネントのアンマウント時にカメラを停止
    return () => {
      if (codeReaderRef.current && videoRef.current) {
        // カメラストリームを停止
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
        codeReaderRef.current = null;
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // 利用可能なカメラデバイスを取得（静的メソッド）
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('カメラが見つかりません。デバイスにカメラが接続されているか確認してください。');
      }

      // バックカメラを優先的に使用
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      const selectedDevice = backCamera || videoInputDevices[0];

      // カメラストリームを明示的に開始
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDevice.deviceId } }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // 継続的にバーコードをスキャン（decodeFromVideoDeviceを使用）
        codeReader.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const barcode = result.getText();
              // バーコードが8-14桁の数字かチェック
              if (/^\d{8,14}$/.test(barcode)) {
                // カメラストリームを停止
                stopScanning();
                onScan(barcode);
              } else {
                setError('有効なバーコードを読み取れませんでした。8-14桁の数字が必要です。');
              }
            } else if (error && !(error instanceof NotFoundException)) {
              // NotFoundException以外のエラーのみ表示
              setError(error.message || 'スキャン中にエラーが発生しました。');
            }
            // NotFoundExceptionの場合は何もしない（継続してスキャン）
          }
        );
      } catch (mediaError) {
        // getUserMediaが失敗した場合、デバイスIDなしで再試行
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // 継続的にバーコードをスキャン
        codeReader.decodeFromVideoDevice(
          undefined, // デフォルトカメラを使用
          videoRef.current,
          (result, error) => {
            if (result) {
              const barcode = result.getText();
              // バーコードが8-14桁の数字かチェック
              if (/^\d{8,14}$/.test(barcode)) {
                // カメラストリームを停止
                stopScanning();
                onScan(barcode);
              } else {
                setError('有効なバーコードを読み取れませんでした。8-14桁の数字が必要です。');
              }
            } else if (error && !(error instanceof NotFoundException)) {
              // NotFoundException以外のエラーのみ表示
              setError(error.message || 'スキャン中にエラーが発生しました。');
            }
            // NotFoundExceptionの場合は何もしない（継続してスキャン）
          }
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        setIsScanning(false);
        // カメラストリームを停止
        if (videoRef.current) {
          const stream = videoRef.current.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          videoRef.current.srcObject = null;
        }
        codeReaderRef.current = null;
      }
    }
  };

  const stopScanning = () => {
    // カメラストリームを停止
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      videoRef.current.srcObject = null;
    }
    
    // スキャンを停止
    codeReaderRef.current = null;
    setIsScanning(false);
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

  const handleDemoScan = () => {
    stopScanning();
    onScan('4901330571481');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
        {!isScanning ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-40 border-2 border-emerald-500 rounded-lg relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
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
          <>
            <Button
              onClick={startScanning}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              <Camera className="w-4 h-4 mr-2" />
              カメラでスキャン
            </Button>
            <Button
              onClick={handleDemoScan}
              variant="outline"
              className="flex-1"
            >
              デモスキャン
            </Button>
          </>
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

