import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { DetectedPanel, RecognitionResult } from "../types";
import { PanelRecognizer } from "../utils/PanelRecognizer";

interface ImageRecognitionPanelProps {
  difficulty: "easy" | "medium" | "hard" | "expert";
  onRecognitionComplete: (panels: DetectedPanel[]) => void;
}

export function ImageRecognitionPanel({
  difficulty,
  onRecognitionComplete,
}: ImageRecognitionPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch {
      window.alert(
        "カメラへのアクセスに失敗しました。ブラウザの設定で許可を確認してください。",
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const recognizeImage = async (file: File) => {
    setIsProcessing(true);
    try {
      const recognizer = new PanelRecognizer(difficulty);
      const recognition = await recognizer.recognizeFromImage(file);
      setResult(recognition);

      if (recognition.success && recognition.confidence > 0.7) {
        onRecognitionComplete(recognition.panels);
        window.alert(
          `盤面を読み取りました。信頼度: ${(
            recognition.confidence * 100
          ).toFixed(1)}%`,
        );
      } else if (recognition.success) {
        const confirmed = window.confirm(
          `認識精度が低い可能性があります（${(
            recognition.confidence * 100
          ).toFixed(1)}%）。それでも適用しますか？`,
        );
        if (confirmed) {
          onRecognitionComplete(recognition.panels);
        }
      } else {
        window.alert("画像の認識に失敗しました。別の画像を試してください。");
      }
    } catch {
      window.alert("画像認識でエラーが発生しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b ?? new Blob()), "image/png");
    });

    await recognizeImage(
      new File([blob], "capture.png", { type: "image/png" }),
    );
    stopCamera();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await recognizeImage(file);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-semibold text-gray-600 mb-3">
        画像から盤面を読み取り
      </h2>

      {cameraActive && (
        <div className="mb-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md mx-auto rounded-lg shadow"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!cameraActive ? (
          <>
            <button
              onClick={startCamera}
              disabled={isProcessing}
              className="flex-1 min-w-40 px-4 py-2 rounded-lg font-semibold text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              カメラで撮影
            </button>
            <label className="flex-1 min-w-40 px-4 py-2 rounded-lg font-semibold text-sm bg-green-500 text-white hover:bg-green-600 cursor-pointer text-center">
              画像を選択
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </>
        ) : (
          <>
            <button
              onClick={captureAndRecognize}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
            >
              撮影して認識
            </button>
            <button
              onClick={stopCamera}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg font-semibold text-sm bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              キャンセル
            </button>
          </>
        )}
      </div>

      {isProcessing && (
        <div className="mt-3 flex items-center justify-center gap-3 rounded-lg bg-blue-50 p-3 text-blue-700 text-sm">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          画像を解析中...
        </div>
      )}

      {result && !isProcessing && (
        <div
          className={`mt-3 rounded-lg p-3 text-sm ${
            result.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {result.success
            ? `認識成功 (信頼度: ${(result.confidence * 100).toFixed(1)}%)`
            : "認識に失敗しました"}
          <div className="text-xs text-gray-600 mt-1">
            処理時間: {result.processingTime.toFixed(0)}ms
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="text-xs text-red-600 mt-1">
              エラー: {result.errors.join(", ")}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
        盤面全体が写るように撮影し、明るい場所で試してください。
      </div>
    </div>
  );
}
