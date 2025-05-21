import { useState, useRef } from "react";
import { Upload, ImagePlus, Check, AlertTriangle, Loader2 } from "lucide-react";

interface AnalysisResult {
  healthy: boolean;
  confidence: string;
  details: string;
}

export default function LeafHealthAnalysis() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);

    try {
      const img = new Image();
      img.src = previewUrl!;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 128, 128);
      const imageBase64 = canvas.toDataURL("image/jpeg");

      const response = await fetch("/api/analyze-leaf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: imageBase64 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unknown error");

      setResult({
        healthy: data.isHealthy,
        confidence: data.confidence.toFixed(1),
        details: data.details,
      });
    } catch (err: any) {
      setResult({
        healthy: false,
        confidence: "0.0",
        details: `Analysis failed: ${err.message}`,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="flex flex-col space-y-6 p-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Leaf Health Analysis</h1>
        <p className="text-gray-500">
          Upload a photo of your crop leaf to analyze its health status
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center transition-all ${
          previewUrl
            ? "border-green-400"
            : "border-gray-300 hover:border-blue-400"
        }`}
        style={{ minHeight: "320px" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={!previewUrl ? triggerFileInput : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageSelect}
        />

        {!previewUrl ? (
          <div className="space-y-4 cursor-pointer">
            <div className="bg-gray-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
              <ImagePlus className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <p className="font-medium">Drag & drop your image here</p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Supports JPG, PNG (max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt="Leaf preview"
            className="rounded-lg shadow-md max-h-64 object-contain"
          />
        )}
      </div>

      {previewUrl && !result && !analyzing && (
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-2 rounded-md bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 transition"
            onClick={reset}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 transition"
            onClick={analyzeImage}
          >
            <Upload size={18} />
            Analyze Image
          </button>
        </div>
      )}

      {analyzing && (
        <div className="text-center p-6">
          <Loader2 className="w-10 h-10 mx-auto text-blue-500 animate-spin" />
          <p className="mt-4 font-medium">Analyzing leaf health...</p>
        </div>
      )}

      {result && (
        <div
          className={`border rounded-lg p-6 ${
            result.healthy
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`rounded-full p-2 ${
                result.healthy ? "bg-green-100" : "bg-amber-100"
              }`}
            >
              {result.healthy ? (
                <Check className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  result.healthy ? "text-green-700" : "text-amber-700"
                }`}
              >
                {result.healthy
                  ? "Healthy Leaf Detected"
                  : "Potential Issue Detected"}
              </h2>
              <p className="mt-1 text-gray-600">{result.details}</p>
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm">{result.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      result.healthy ? "bg-green-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  className="px-6 py-2 rounded-md bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 transition"
                  onClick={reset}
                >
                  Try Another Image
                </button>
                <button className="px-6 py-2 rounded-md bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 transition">
                  Save Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
