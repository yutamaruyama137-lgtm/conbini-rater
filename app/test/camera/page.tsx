'use client';

import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { Camera, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CameraTestPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [cameraStatus, setCameraStatus] = useState<string>('未起動');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // カメラデバイスを取得
    const getDevices = async () => {
      try {
        addDebugInfo('カメラデバイスの取得を開始...');
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        setDevices(videoInputDevices);
        addDebugInfo(`カメラデバイスを ${videoInputDevices.length} 個見つけました`);
        
        if (videoInputDevices.length > 0) {
          // バックカメラを優先的に選択
          const backCamera = videoInputDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear')
          );
          const deviceToSelect = backCamera || videoInputDevices[0];
          setSelectedDeviceId(deviceToSelect.deviceId);
          addDebugInfo(`選択されたデバイス: ${deviceToSelect.label} (${deviceToSelect.deviceId})`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '不明なエラー';
        addDebugInfo(`エラー: ${errorMessage}`);
        setError(errorMessage);
      }
    };

    getDevices();
  }, []);

  useEffect(() => {
    // コンポーネントのアンマウント時にカメラを停止
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) {
      addDebugInfo('エラー: video要素が見つかりません');
      setError('video要素が見つかりません');
      return;
    }

    try {
      setError(null);
      setScannedBarcode(null);
      setIsScanning(true);
      setCameraStatus('起動中...');
      addDebugInfo('スキャンを開始...');

      // ZXing 初期化
      const reader = new BrowserMultiFormatReader();
      codeReaderRef.current = reader;

      // 背面カメラ優先（対応端末は 'environment' を使う）
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      addDebugInfo('カメラへのアクセス許可をリクエスト...');

      // 許可ダイアログ → ストリーム取得
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // iOS Safari はユーザー操作後だと安定
        addDebugInfo('カメラストリームを取得しました');
      }

      // 連続スキャン開始（検出時ごとにコールバック）
      reader.decodeFromVideoDevice(
        undefined, // 既定デバイス
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            addDebugInfo(`バーコードを検出: ${text}`);
            setScannedBarcode(text);
            setCameraStatus('バーコード検出済み');
            stopScanning();
          }
          // err は検出できないフレームで普通に発生するので握りつぶしてOK（NotFoundException以外は表示）
          if (err && !(err instanceof NotFoundException)) {
            const errorMessage = err.message || '不明なエラー';
            addDebugInfo(`エラー: ${errorMessage}`);
            setError(errorMessage);
            setCameraStatus('エラー');
          } else if (err instanceof NotFoundException) {
            setCameraStatus('スキャン中...');
          }
        }
      );

      setCameraStatus('スキャン中');
      addDebugInfo('カメラストリームを開始しました');
    } catch (e: any) {
      // 失敗時のエラーハンドリング
      const errorMessage = e?.message ?? 'カメラへのアクセスに失敗しました。カメラの許可を確認してください。';
      addDebugInfo(`エラー: ${errorMessage}`);
      setError(errorMessage);
      setIsScanning(false);
      setCameraStatus('エラー');
      
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
    addDebugInfo('スキャンを停止...');
    
    if (codeReaderRef.current) {
      codeReaderRef.current = null;
    }
    
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setCameraStatus('停止');
    addDebugInfo('スキャンを停止しました');
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">カメラ機能テストページ</h1>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          ホームに戻る
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* カメラプレビュー */}
        <Card>
          <CardHeader>
            <CardTitle>カメラプレビュー</CardTitle>
            <CardDescription>ステータス: {cameraStatus}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline // iOS Safari 必須
                muted       // 自動再生の安定性向上
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">カメラが起動していません</p>
                  </div>
                </div>
              )}
            </div>

            {scannedBarcode && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>スキャン成功:</strong> {scannedBarcode}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {!isScanning ? (
                <Button
                  onClick={startScanning}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  disabled={!selectedDeviceId || devices.length === 0}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  スキャンを開始
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  className="flex-1"
                >
                  スキャンを停止
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* カメラデバイス選択 */}
        <Card>
          <CardHeader>
            <CardTitle>カメラデバイス</CardTitle>
            <CardDescription>利用可能なカメラデバイス一覧</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {devices.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  カメラデバイスが見つかりませんでした。デバイスにカメラが接続されているか確認してください。
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {devices.map((device) => (
                  <label
                    key={device.deviceId}
                    className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="device"
                      value={device.deviceId}
                      checked={selectedDeviceId === device.deviceId}
                      onChange={(e) => {
                        setSelectedDeviceId(e.target.value);
                        addDebugInfo(`デバイスを変更: ${device.label}`);
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{device.label || '無名のデバイス'}</div>
                      <div className="text-sm text-gray-500">{device.deviceId}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* デバッグ情報 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>デバッグ情報</CardTitle>
            <Button variant="outline" size="sm" onClick={clearDebugInfo}>
              <X className="w-4 h-4 mr-2" />
              クリア
            </Button>
          </div>
          <CardDescription>カメラ機能の動作状況を確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <div className="text-gray-500">デバッグ情報がありません</div>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 使用方法 */}
      <Card>
        <CardHeader>
          <CardTitle>使用方法</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ol className="list-decimal list-inside space-y-1">
            <li>カメラデバイスを選択してください（自動的にバックカメラが選択されます）</li>
            <li>「スキャンを開始」ボタンをクリックしてカメラを起動します</li>
            <li>ブラウザでカメラへのアクセス許可を求められたら「許可」を選択してください</li>
            <li>バーコードをカメラに向けてください</li>
            <li>バーコードが検出されると自動的に表示されます</li>
            <li>デバッグ情報で動作状況を確認できます</li>
          </ol>
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>注意:</strong> HTTPS接続またはlocalhostでのみカメラ機能が動作します。
              また、ブラウザによってはカメラへのアクセス許可が必要です。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </main>
  );
}

