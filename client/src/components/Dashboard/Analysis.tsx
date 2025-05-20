import { useState, useRef } from "react";
import { Upload, ImagePlus, Check, AlertTriangle, Loader2 } from "lucide-react";

// Define the Result type to fix TypeScript errors
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const analyzeImage = () => {
    if (!selectedImage) return;
    
    setAnalyzing(true);
    
    // Simulate AI analysis with a timeout
    setTimeout(() => {
      // Generate a random result for demonstration
      const isHealthy = Math.random() > 0.3;
      
      setResult({
        healthy: isHealthy,
        confidence: (Math.random() * 20 + 80).toFixed(1), // Random confidence between 80-100%
        details: isHealthy 
          ? "No signs of disease or pest damage detected."
          : "Possible signs of leaf spot disease detected. Consider treatment with fungicide."
      });
      
      setAnalyzing(false);
    }, 2500);
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="flex flex-col space-y-6 p-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Leaf Health Analysis</h1>
        <p className="text-gray-500">Upload a photo of your crop leaf to analyze its health status</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center transition-all ${
          previewUrl ? "border-green-400" : "border-gray-300 hover:border-blue-400"
        }`}
        style={{ minHeight: "320px" }}
        onDragOver={handleDragOver}
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
              <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
              <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG (max 10MB)</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-md">
            <img 
              src={previewUrl} 
              alt="Leaf preview" 
              className="rounded-lg shadow-md max-h-64 mx-auto object-contain"
            />
          </div>
        )}
      </div>

      {previewUrl && !result && !analyzing && (
        <div className="flex justify-center gap-4">
          <button 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            onClick={resetAnalysis}
          >
            Cancel
          </button>
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors"
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
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      )}

      {result && (
        <div className={`border rounded-lg p-6 ${result.healthy ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`rounded-full p-2 ${result.healthy ? 'bg-green-100' : 'bg-amber-100'}`}>
              {result.healthy ? (
                <Check className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${result.healthy ? 'text-green-700' : 'text-amber-700'}`}>
                {result.healthy ? 'Healthy Leaf Detected' : 'Potential Issue Detected'}
              </h2>
              <p className="mt-1 text-gray-600">{result.details}</p>
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm">{result.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${result.healthy ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button 
                  className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors"
                  onClick={resetAnalysis}
                >
                  Try Another Image
                </button>
                <button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors">
                  Save Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="font-semibold text-lg mb-4">Recent Analyses</h3>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border rounded-md p-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-32 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                <img src="/api/placeholder/120/90" alt="placeholder" className="max-h-full object-cover" />
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item !== 2 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm font-medium">{item !== 2 ? 'Healthy' : 'Issue Detected'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Analyzed May {10 + item}, 2025</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}