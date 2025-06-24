import { useState, useRef } from "react";
import {
  Upload,
  ImagePlus,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface AnalysisResult {
  isHealthy: boolean;
  confidence: number;
  className: string;
  plantName: string;
  condition: string;
  details: string;
}

export default function LeafHealthAnalysis() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const analyzeImage = async () => {
    if (!selectedImage || !previewUrl) return;
    setAnalyzing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      ctx.drawImage(img, 0, 0, 128, 128);
      const imageBase64 = canvas.toDataURL("image/jpeg");

      const response = await fetch("/api/analyze-leaf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: imageBase64 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      setResult({
        isHealthy: data.isHealthy,
        confidence: data.confidence,
        className: data.className,
        plantName: data.plantName || data.className.split('___')[0].replace('_', ' '),
        condition: data.condition || data.className.split('___')[1].replace('_', ' '),
        details: data.details,
      });
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return "High Confidence";
    if (confidence >= 60) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <div className="flex flex-col space-y-6 p-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Leaf Health Analysis</h1>
        <p className="text-gray-600">
          Upload a photo of your crop leaf to analyze its health status using AI
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center transition-all ${
          previewUrl
            ? "border-green-400 bg-green-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer"
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
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
              <ImagePlus className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Drag & drop your image here</p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Supports JPG, PNG, GIF (max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Leaf preview"
              className="rounded-lg shadow-md max-h-64 object-contain"
            />
            <p className="text-sm text-gray-600 font-medium">
              Image ready for analysis
            </p>
          </div>
        )}
      </div>

      {previewUrl && !result && !analyzing && !error && (
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
            onClick={reset}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md"
            onClick={analyzeImage}
          >
            <Upload size={18} />
            Analyze Leaf
          </button>
        </div>
      )}

      {analyzing && (
        <div className="text-center p-8 bg-blue-50 rounded-lg border">
          <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
          <p className="mt-4 font-medium text-blue-700">Analyzing leaf health...</p>
          <p className="text-sm text-blue-600 mt-1">This may take a few seconds</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full p-2 bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-700">Analysis Failed</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={reset}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div
          className={`border rounded-lg p-6 shadow-md ${
            result.isHealthy
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`rounded-full p-3 ${
                result.isHealthy ? "bg-green-100" : "bg-amber-100"
              }`}
            >
              {result.isHealthy ? (
                <Check className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <h2
                className={`text-2xl font-bold ${
                  result.isHealthy ? "text-green-700" : "text-amber-700"
                }`}
              >
                {result.isHealthy
                  ? "✅ Healthy Leaf Detected"
                  : "⚠️ Potential Issue Detected"}
              </h2>
              
              <div className="mt-3 space-y-2">
                <p className="text-gray-700">
                  <strong>Plant:</strong> {result.plantName}
                </p>
                <p className="text-gray-700">
                  <strong>Condition:</strong> {result.condition}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Full Classification:</strong> {result.className}
                </p>
              </div>

              <div className="mt-4 p-3 bg-white rounded-md border">
                <p className="text-gray-700">{result.details}</p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Confidence Level
                  </span>
                  <span className="text-sm font-semibold">
                    {result.confidence.toFixed(1)}% - {getConfidenceText(result.confidence)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getConfidenceColor(result.confidence)} transition-all duration-500`}
                    style={{ width: `${Math.min(result.confidence, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="px-6 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                  onClick={reset}
                >
                  Analyze Another Image
                </button>
                <button 
                  className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md"
                  onClick={() => {
                    // You can implement save functionality here
                    console.log("Saving result:", result);
                    alert("Result saved! (Feature to be implemented)");
                  }}
                >
                  Save Result
                </button>
                <button 
                  className="px-6 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors shadow-md"
                  onClick={() => {
                    // Share or export functionality
                    const shareText = `Plant Analysis Result:\nPlant: ${result.plantName}\nCondition: ${result.condition}\nConfidence: ${result.confidence.toFixed(1)}%`;
                    navigator.clipboard.writeText(shareText);
                    alert("Result copied to clipboard!");
                  }}
                >
                  Share Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}