"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import NoImageAvailable from "~/components/noImageAvailable";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "~/components/ui/dialog";

// Receipt Image Component with Zoom
interface ReceiptImageProps {
  imageUrl?: string;
  altText?: string;
}

export function ReceiptImage({ imageUrl, altText = "Receipt" }: ReceiptImageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 5, 200)); // Changed to 10% increments
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 5, 50)); // Changed to 10% decrements
  };

  const handleReset = () => {
    setZoom(100);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Receipt Image</h3>
          <p className="text-sm text-muted-foreground">Original scanned document</p>
        </div>
      </div>

      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          {imageUrl ? (
            <div className="relative group">
              <img
                src={imageUrl}
                alt={altText}
                className="w-full h-auto object-contain max-h-[800px] cursor-pointer"
                onClick={() => setIsFullscreen(true)}
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Maximize2 className="w-4 h-4" />
                    Click to enlarge
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted">
              <NoImageAvailable />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Dialog - Remove default close button */}
      {imageUrl && (
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent 
            className="max-w-[95vw] w-full h-[95vh] p-0 gap-0 flex flex-col [&>button]:hidden"
          >
            {/* Header with Controls */}
            <div className="flex items-center justify-between p-4 border-b bg-background shrink-0">
              <h2 className="text-lg font-semibold">Receipt Image</h2>
              
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="h-8 w-8"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="h-8 w-8"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={zoom === 100}
                  className="h-8 px-3"
                >
                  Reset
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 overflow-auto bg-muted/20">
              <div className="flex items-center justify-center min-h-full p-4">
                <img
                  src={imageUrl}
                  alt={altText}
                  className="transition-transform duration-200 ease-out"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center center',
                    maxWidth: zoom > 100 ? 'none' : '100%',
                    height: 'auto',
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}