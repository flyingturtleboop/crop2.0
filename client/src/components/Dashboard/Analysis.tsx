import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Check,
  AlertTriangle,
  Loader2,
  Info,
  RefreshCw,
  Camera
} from "lucide-react";

interface AnalysisResult {
  isHealthy: boolean;
  confidence: number;
  className: string;
  plantName: string;
  condition: string;
  details: string;
}

interface ModelStatus {
  tensorflow_available: boolean;
  model_loaded: boolean;
  model_path: string;
  classes_count: number;
  available_classes: string[];
  status: string;
}

export default function LeafHealthAnalysis() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backend API base URL - adjust if your backend runs on different port
  const API_BASE = process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:5000';

  // Check model status on component mount
  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await fetch(`${API_BASE}/api/model-status`);
      const data = await response.json();
      setModelStatus(data);
      console.log('Model Status:', data);
    } catch (err) {
      console.error('Failed to check model status:', err);
      setError('Failed to connect to backend. Make sure the Flask server is running on port 5000.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size too large. Please select an image under 10MB.');
        return;
      }
      
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
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please select an image under 10MB.');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const analyzeImage = async () => {
    if (!selectedImage || !previewUrl) return;
    
    // Check if model is ready
    if (!modelStatus?.model_loaded) {
      setError('AI model is not loaded. Please check the backend logs and ensure plant_disease_model_v3.keras is available.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      console.log('🔍 Starting image analysis...');
      
      // Create and load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = previewUrl;
      });

      console.log('📷 Image loaded, creating canvas...');

      // Create canvas and draw image
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }

      // Draw image to canvas with proper scaling
      ctx.drawImage(img, 0, 0, 128, 128);
      
      // Convert to base64
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);
      console.log('🎨 Canvas created and image converted to base64');

      // Send to backend
      console.log('📡 Sending request to backend...');
      const response = await fetch(`${API_BASE}/api/analyze-leaf`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ imageData: imageBase64 }),
      });

      console.log('📨 Response received:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Analysis result:', data);

      setResult({
        isHealthy: data.isHealthy,
        confidence: data.confidence,
        className: data.className,
        plantName: data.plantName || data.className.split('___')[0]?.replace('_', ' ') || 'Unknown',
        condition: data.condition || data.className.split('___')[1]?.replace('_', ' ') || 'Unknown',
        details: data.details,
      });

    } catch (err: unknown) {
      console.error("❌ Analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(`Analysis failed: ${errorMessage}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-50 border-green-200';
      case 'tensorflow_missing': return 'text-red-600 bg-red-50 border-red-200';
      case 'model_not_loaded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'ready': return 'AI model is ready for analysis';
      case 'tensorflow_missing': return 'TensorFlow is not installed on the backend';
      case 'model_not_loaded': return 'plant_disease_model_v3.keras is not loaded';
      default: return 'Unknown status';
    }
  };

  const getRecommendations = (result: AnalysisResult) => {
    const { isHealthy, condition } = result;
    
    if (isHealthy) {
      return {
        title: "Maintenance Recommendations",
        items: [
          "Continue current care routine as the plant appears healthy",
          "Monitor regularly for any changes in leaf appearance",
          "Ensure adequate water drainage to prevent root rot",
          "Maintain consistent watering schedule",
          "Provide appropriate sunlight exposure for the plant type",
          "Consider seasonal fertilization for optimal growth",
          "Remove any dead or yellowing leaves promptly",
          "Ensure good air circulation around the plant"
        ]
      };
    } else {
      // Disease-specific recommendations
      const lowerCondition = condition.toLowerCase();
      const recommendations = [
        "Isolate affected plants to prevent disease spread",
        "Remove and dispose of infected leaves immediately",
        "Improve air circulation around the plant",
        "Avoid watering leaves directly - water at soil level"
      ];

      if (lowerCondition.includes('blight') || lowerCondition.includes('spot')) {
        recommendations.push(
          "Apply copper-based fungicide as directed",
          "Reduce humidity levels around the plant",
          "Space plants properly to improve airflow",
          "Water early in the day to allow leaves to dry"
        );
      } else if (lowerCondition.includes('rust')) {
        recommendations.push(
          "Apply sulfur-based fungicide treatment",
          "Remove affected plant debris from soil",
          "Avoid overhead watering",
          "Improve soil drainage"
        );
      } else if (lowerCondition.includes('mildew')) {
        recommendations.push(
          "Treat with neem oil or horticultural oil",
          "Increase air circulation significantly",
          "Reduce humidity and avoid overcrowding",
          "Apply preventive fungicide if problem persists"
        );
      } else if (lowerCondition.includes('virus') || lowerCondition.includes('mosaic')) {
        recommendations.push(
          "Remove and destroy infected plants immediately",
          "Control insect vectors (aphids, whiteflies)",
          "Disinfect tools between plants",
          "Consider resistant varieties for replanting"
        );
      } else {
        recommendations.push(
          "Consult with local agricultural extension office",
          "Consider soil testing for nutrient deficiencies",
          "Apply appropriate fungicide or bactericide treatment",
          "Monitor closely for symptom progression"
        );
      }

      recommendations.push(
        "Schedule follow-up inspection in 7-10 days",
        "Document treatment applications and dates",
        "Consider professional consultation if symptoms worsen"
      );

      return {
        title: "Treatment Recommendations",
        items: recommendations
      };
    }
  };

  const generatePDFReport = (result: AnalysisResult) => {
    const recommendations = getRecommendations(result);
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const reportId = Date.now().toString(36).toUpperCase();

    // Create HTML content for PDF
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0; font-size: 28px;">🌱 Leaf Health Analysis Report</h1>
          <p style="color: #666; margin: 5px 0;">AI-Powered Plant Disease Detection</p>
          <p style="color: #666; margin: 5px 0;">Generated on ${currentDate} at ${currentTime}</p>
        </div>

        <div style="margin: 25px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0; margin-bottom: 15px;">Analysis Results</h2>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 16px; ${result.isHealthy 
              ? 'background-color: #dcfce7; color: #166534; border: 2px solid #22c55e;'
              : 'background-color: #fef3c7; color: #92400e; border: 2px solid #f59e0b;'
            }">
              ${result.isHealthy ? '✅ HEALTHY PLANT' : '⚠️ ISSUE DETECTED'}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div style="padding: 15px; background-color: white; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-weight: bold; color: #374151; margin-bottom: 8px;">Plant Type</div>
              <div style="color: #6b7280;">${result.plantName}</div>
            </div>
            <div style="padding: 15px; background-color: white; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-weight: bold; color: #374151; margin-bottom: 8px;">Condition</div>
              <div style="color: #6b7280;">${result.condition}</div>
            </div>
            <div style="padding: 15px; background-color: white; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-weight: bold; color: #374151; margin-bottom: 8px;">Confidence Level</div>
              <div style="color: #6b7280;">${result.confidence.toFixed(1)}%</div>
            </div>
            <div style="padding: 15px; background-color: white; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-weight: bold; color: #374151; margin-bottom: 8px;">Classification</div>
              <div style="color: #6b7280;">${result.className}</div>
            </div>
          </div>

          <div style="margin: 25px 0; padding: 15px; background-color: white; border-radius: 6px; border: 1px solid #e5e7eb;">
            <strong>Confidence Assessment:</strong>
            <div style="width: 100%; height: 25px; background-color: #e5e7eb; border-radius: 12px; overflow: hidden; margin: 15px 0;">
              <div style="height: 100%; ${result.confidence >= 80 
                ? 'background: linear-gradient(90deg, #22c55e, #16a34a);' 
                : result.confidence >= 60 
                ? 'background: linear-gradient(90deg, #eab308, #ca8a04);' 
                : 'background: linear-gradient(90deg, #ef4444, #dc2626);'
              } width: ${Math.min(result.confidence, 100)}%; border-radius: 12px;"></div>
            </div>
            <div style="text-align: center; font-weight: bold; color: #374151;">
              ${result.confidence.toFixed(1)}% - ${result.confidence >= 80 ? 'High Confidence' : result.confidence >= 60 ? 'Medium Confidence' : 'Low Confidence'}
            </div>
          </div>
        </div>

        <div style="background-color: white; border-left: 6px solid #22c55e; padding: 25px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <h3 style="margin-top: 0; margin-bottom: 15px; color: #22c55e; font-size: 20px;">${recommendations.title}</h3>
          <ul style="padding-left: 25px;">
            ${recommendations.items.map(item => `<li style="margin: 10px 0; line-height: 1.5;">${item}</li>`).join('')}
          </ul>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3 style="color: #374151; margin-bottom: 15px;">Analysis Details</h3>
          <p style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #6b7280;">${result.details}</p>
        </div>

        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #0ea5e9; margin-bottom: 15px;">Next Steps</h3>
          <ul style="padding-left: 25px;">
            <li style="margin: 8px 0; color: #075985;">Monitor plant condition regularly</li>
            <li style="margin: 8px 0; color: #075985;">Follow the recommended treatment plan</li>
            <li style="margin: 8px 0; color: #075985;">Document any changes in plant health</li>
            <li style="margin: 8px 0; color: #075985;">Consult with agricultural experts if needed</li>
            ${!result.isHealthy ? '<li style="margin: 8px 0; color: #075985;">Consider retesting after treatment application</li>' : ''}
          </ul>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 25px; border-top: 2px solid #e5e7eb; color: #666; font-size: 12px;">
          <p><strong>Important Notice</strong></p>
          <p>This report was generated using AI-powered plant disease detection technology.</p>
          <p>For best results, consult with local agricultural experts and follow integrated pest management practices.</p>
          <div style="background-color: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-family: monospace; color: #374151; margin-top: 10px; display: inline-block;">Report ID: ${reportId}</div>
        </div>
      </div>
    `;

    // Create a new window for printing - SINGLE WINDOW APPROACH
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate the PDF report');
      return;
    }

    // Write the HTML content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Leaf_Health_Report_${result.plantName.replace(/\s+/g, '_')}_${reportId}</title>
        <style>
          @media print { body { margin: 0; } @page { margin: 0.75in; } }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `);

    printWindow.document.close();

    // Trigger the browser's native print dialog
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="flex flex-col space-y-6 p-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">🌱 Leaf Health Analysis</h1>
        <p className="text-gray-600">
          Upload a photo of your crop leaf to analyze its health status using AI
        </p>
      </div>

      {/* Model Status Display */}
      {checkingStatus ? (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />
          <span className="text-blue-700">Checking AI model status...</span>
        </div>
      ) : modelStatus ? (
        <div className={`p-4 border rounded-lg ${getStatusColor(modelStatus.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              <span className="font-medium">Model Status: {getStatusMessage(modelStatus.status)}</span>
            </div>
            <button 
              onClick={checkModelStatus}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-white rounded border hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <div className="mt-2 text-sm">
            <p>Model Path: {modelStatus.model_path}</p>
            <p>Classes Available: {modelStatus.classes_count}</p>
            <p>Backend Connected: {modelStatus ? '✅' : '❌'}</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Cannot connect to backend</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Make sure Flask server is running on http://localhost:5000
          </p>
        </div>
      )}

      {/* Image Upload Area */}
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
              <Camera className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Drag & drop your leaf image here</p>
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

      {/* Action Buttons */}
      {previewUrl && !result && !analyzing && !error && (
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg font-medium"
            onClick={reset}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={analyzeImage}
            disabled={!modelStatus?.model_loaded}
          >
            <Upload size={18} />
            Analyze Leaf Health
          </button>
        </div>
      )}

      {/* Loading State */}
      {analyzing && (
        <div className="text-center p-8 bg-blue-50 rounded-lg border">
          <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
          <p className="mt-4 font-medium text-blue-700">Analyzing leaf health...</p>
          <p className="text-sm text-blue-600 mt-1">Processing with AI model plant_disease_model_v3.keras</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full p-2 bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700">Analysis Failed</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <div className="mt-4 flex gap-2">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  onClick={reset}
                >
                  Try Again
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  onClick={checkModelStatus}
                >
                  Check Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
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
                  <strong>Classification:</strong> {result.className}
                </p>
              </div>

              <div className="mt-4 p-3 bg-white rounded-md border">
                <p className="text-gray-700 whitespace-pre-line">{result.details}</p>
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
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-medium"
                  onClick={reset}
                >
                  Analyze Another Image
                </button>
                <button 
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium"
                  onClick={() => generatePDFReport(result)}
                >
                  Save Result
                </button>
                <button 
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg font-medium"
                  onClick={() => {
                    const shareText = `🌱 Leaf Analysis Result:\n\nPlant: ${result.plantName}\nCondition: ${result.condition}\nConfidence: ${result.confidence.toFixed(1)}%\nStatus: ${result.isHealthy ? 'Healthy' : 'Needs Attention'}\n\nAnalyzed with AI plant disease detection`;
                    navigator.clipboard.writeText(shareText).then(() => {
                      alert("Result copied to clipboard!");
                    }).catch(() => {
                      console.log("Fallback: ", shareText);
                      alert("Sharing not supported, check console for result text.");
                    });
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