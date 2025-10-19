import { ImageOff, Upload } from "lucide-react";
import { Button } from "~/components/ui/button";

interface NoImageAvailableProps {
  onUpload?: () => void;
  showUploadButton?: boolean;
}

export default function NoImageAvailable({ 
  onUpload, 
  showUploadButton = true 
}: NoImageAvailableProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg border-2 border-dashed border-border">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center mb-4">
        <ImageOff className="w-8 h-8 text-muted-foreground" />
      </div>

      {/* Text */}
      <h3 className="text-lg font-medium text-foreground mb-1">
        No image available
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Receipt image has not been uploaded yet
      </p>

      {/* Upload Button (Optional) */}
      {/* {showUploadButton && (
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={onUpload}
        >
          <Upload className="w-4 h-4" />
          Upload image
        </Button>
      )} */}
    </div>
  );
}