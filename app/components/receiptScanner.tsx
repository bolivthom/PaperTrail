"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, Loader2, AlertCircleIcon, Image as ImageIcon } from 'lucide-react';

// Assuming these components exist in your project
const Card = ({ children, className = "" }) => (
  <div className={`border border-border shadow-sm rounded-2xl bg-card ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-6 pb-4">{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

const CardContent = ({ children }) => (
  <div className="px-6 pb-6">{children}</div>
);

const Button = ({ children, onClick, disabled, variant = "default", size = "default", className = "" }) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:opacity-90",
    outline: "border border-input bg-background hover:bg-accent",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  const sizeStyles = {
    default: "px-4 py-2",
    sm: "px-3 py-1.5 text-sm",
    icon: "size-8"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function ReceiptScanner() {
  const [scanMode, setScanMode] = useState(null); // 'camera' or 'upload'
  const [scannedImage, setScannedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize camera when scanMode changes to 'camera'
  useEffect(() => {
    if (scanMode === 'camera') {
      initializeCamera();
    }
    
    // Cleanup on unmount or when scanMode changes
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanMode]);

  const initializeCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Ensure video plays
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error('Play error:', playError);
        }
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setUploadStatus({
        type: 'error',
        message: err.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow camera access.'
          : `Unable to access camera: ${err.message}`
      });
      setScanMode(null);
    }
  };

  const startCamera = () => {
    setScanMode('camera');
    setUploadStatus(null);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanMode(null);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setScannedImage(imageData);
      stopCamera();
      processReceipt(imageData);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus({
          type: 'error',
          message: 'File size must be less than 5MB'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setScannedImage(e.target.result);
        setScanMode('upload');
        setUploadStatus(null);
        processReceipt(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processReceipt = (imageData) => {
    setIsProcessing(true);
    setUploadProgress(0);
    setUploadStatus(null);
    
    // Simulate processing with progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setUploadStatus({
            type: 'success',
            message: 'Receipt processed successfully'
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const resetScanner = () => {
    setScannedImage(null);
    setScanMode(null);
    setUploadProgress(0);
    setIsProcessing(false);
    setUploadStatus(null);
    stopCamera();
  };

  const confirmReceipt = async () => {
    setIsProcessing(true);
    try {
      // Here you would make the actual API call
      // const response = await fetch('/api/receipt', { method: 'POST', ... });
      
      setUploadStatus({
        type: 'success',
        message: 'Receipt saved successfully!'
      });
      
      // Reset after a delay
      setTimeout(() => {
        resetScanner();
      }, 2000);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to save receipt. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-foreground">
            Upload Receipt
            <p className="text-sm text-muted-foreground font-normal mt-1">
              AI powered receipt processing
            </p>
          </CardTitle>
        </CardHeader>

        {/* Upload Status */}
        {uploadStatus && (
          <div className="mx-6 mb-4">
            <div
              className={`p-3 rounded-lg ${
                uploadStatus.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {uploadStatus.type === "success" ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <AlertCircleIcon className="size-4" />
                )}
                <span className="text-sm">{uploadStatus.message}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {!scanMode && !scannedImage && (
          <div className="mx-6 mb-6">
            <div className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileUpload}
                className="sr-only"
                aria-label="Upload receipt file"
              />
              
              <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                <div
                  className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                  aria-hidden="true"
                >
                  <ImageIcon className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">
                  Drop your receipts here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  PDF, PNG, JPG, or WEBP (max. 5MB each)
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary text-primary-foreground hover:opacity-90"
                  >
                    <Upload className="w-4 h-4" />
                    Select files
                  </Button>
                  
                  <Button
                    onClick={startCamera}
                    variant="outline"
                  >
                    <Camera className="w-4 h-4" />
                    Use Camera
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Camera View */}
        {scanMode === 'camera' && !scannedImage && (
          <div className="mx-6 mb-6">
            <div className="relative rounded-xl overflow-hidden border border-input bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-96 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-white border-dashed rounded-xl opacity-50"></div>
              </div>

              {/* Camera Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={stopCamera}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="bg-white hover:bg-gray-100 text-gray-900 rounded-full p-5 shadow-lg transition-all transform hover:scale-105"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scanned Receipt Preview */}
        {scannedImage && (
          <div className="mx-6 mb-6">
            <div className="relative mb-4 rounded-xl overflow-hidden border border-input">
              <img
                src={scannedImage}
                alt="Scanned receipt"
                className="w-full max-h-96 object-contain bg-accent"
              />
              
              {isProcessing && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center px-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium mb-2">Processing receipt...</p>
                    <div className="w-48 bg-gray-200 rounded-full h-1.5 overflow-hidden mx-auto">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{uploadProgress}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={resetScanner}
                disabled={isProcessing}
                variant="outline"
              >
                Scan Another
              </Button>
              <Button
                onClick={confirmReceipt}
                disabled={isProcessing}
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Receipt
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}