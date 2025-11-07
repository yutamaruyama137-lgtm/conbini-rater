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

    if (!selectedDeviceId) {
      addDebugInfo('エラー: カメラデバイスが選択されていません');
      setError('カメラデバイスを選択してください');
      return;
    }

    try {
      setError(null);
      setScannedBarcode(null);
      setIsScanning(true);
      setCameraStatus('起動中...');
      addDebugInfo('スキャンを開始...');

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      addDebugInfo(`デバイスID: ${selectedDeviceId} でスキャンを開始`);

      // カメラストリームを明示的に開始
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          addDebugInfo('カメラストリームを取得しました');
        }

        // 継続的にバーコードをスキャン
        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const barcode = result.getText();
              addDebugInfo(`バーコードを検出: ${barcode}`);
              setScannedBarcode(barcode);
              setCameraStatus('バーコード検出済み');
              stopScanning();
            } else if (error) {
              if (error instanceof NotFoundException) {
                // NotFoundExceptionは無視（継続してスキャン）
                setCameraStatus('スキャン中...');
              } else {
                const errorMessage = error.message || '不明なエラー';
                addDebugInfo(`エラー: ${errorMessage}`);
                setError(errorMessage);
                setCameraStatus('エラー');
              }
            }
          }
        );

        setCameraStatus('スキャン中');
        addDebugInfo('カメラストリームを開始しました');
      } catch (mediaError) {
        // getUserMediaが失敗した場合、デバイスIDなしで再試行
        addDebugInfo('デバイスID指定で失敗、デフォルトカメラで再試行...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          addDebugInfo('デフォルトカメラストリームを取得しました');
        }

        // 継続的にバーコードをスキャン
        codeReader.decodeFromVideoDevice(
          undefined, // デフォルトカメラを使用
          videoRef.current!,
          (result, error) => {
            if (result) {
              const barcode = result.getText();
              addDebugInfo(`バーコードを検出: ${barcode}`);
              setScannedBarcode(barcode);
              setCameraStatus('バーコード検出済み');
              stopScanning();
            } else if (error) {
              if (error instanceof NotFoundException) {
                // NotFoundExceptionは無視（継続してスキャン）
                setCameraStatus('スキャン中...');
              } else {
                const errorMessage = error.message || '不明なエラー';
                addDebugInfo(`エラー: ${errorMessage}`);
                setError(errorMessage);
                setCameraStatus('エラー');
              }
            }
          }
        );

        setCameraStatus('スキャン中');
        addDebugInfo('カメラストリームを開始しました');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      addDebugInfo(`エラー: ${errorMessage}`);
      setError(errorMessage);
      setIsScanning(false);
      setCameraStatus('エラー');
      
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
  };

  const stopScanning = () => {
    addDebugInfo('スキャンを停止...');
    
    // カメラストリームを停止
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          addDebugInfo(`トラックを停止: ${track.kind} - ${track.label}`);
        });
      }
      videoRef.current.srcObject = null;
    }
    
    codeReaderRef.current = null;
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
                playsInline
                muted
                autoPlay
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

