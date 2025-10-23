"use client";
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { formatBytes, useFileUpload } from "~/hooks/use-file-upload";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Notification } from "./notification";

export default function FileUploader() {
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB
  const maxFiles = 6;
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/jpeg,image/jpg,image/png,image/webp,application/pdf",
    maxSize,
    multiple: true,
    maxFiles,
  });

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ show: true, message, type });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showNotification("Please select at least one file to upload", "error");
      return;
    }

    setIsUploading(true);

    try {
      const results = await Promise.allSettled(
        files.map(async (fileWithPreview) => {
          const file = fileWithPreview.file as File;
          const formData = new FormData();
          formData.append("image", file);

          const response = await fetch("/api/receipt", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            let errorMessage = `Upload failed for ${file.name}`;
            try {
              const errorData = await response.json();
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch (parseError) {
              errorMessage = `Upload failed for ${file.name}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
          }

          return { file: file.name, data: await response.json() };
        })
      );

      const succeeded = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      if (failed.length === 0) {
        // All succeeded
        showNotification(
          `Successfully uploaded ${succeeded.length} receipt${succeeded.length > 1 ? "s" : ""}!`,
          "success"
        );
        clearFiles();
      } else if (succeeded.length === 0) {
        // All failed
        const firstError = failed[0].status === "rejected" ? failed[0].reason : null;
        showNotification(
          firstError instanceof Error
            ? firstError.message
            : "All uploads failed. Please try again.",
          "error"
        );
        clearFiles();
      } else {
        // Some succeeded, some failed
        const firstError = failed[0].status === "rejected" ? failed[0].reason : null;
        const errorMsg = firstError instanceof Error ? firstError.message : "Unknown error";
        showNotification(
          `${succeeded.length} receipt${succeeded.length > 1 ? "s" : ""} uploaded successfully, but ${failed.length} failed: ${errorMsg}`,
          "error"
        );
        clearFiles();
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification(
        error instanceof Error ? error.message : "Upload failed. Please try again.",
        "error"
      );
      clearFiles();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Drop area */}
      <Card className="w-full border border-border shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-foreground">
            Upload Receipt
            <p className="text-sm text-muted-foreground mb-1">
              AI powered receipt processing
            </p>
            {/* WARNING AGAINST OTHER CURRENCIES*/}
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-medium">Currently JMD Only</p>
                  <p className="mt-0.5">We currently only support receipts in JMD (Jamaican Dollars). Multi-currency support coming soon!</p>
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          data-files={files.length > 0 || undefined}
          className="relative flex min-h-52 flex-col items-center overflow-hidden mr-8 ml-8 mb-8 rounded-xl border border-dashed border-input transition-colors not-data-[files]:justify-center has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        >
          <input
            {...getInputProps()}
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
            <p className="text-xs text-muted-foreground">
              PDF, PNG or JPG (max. {maxSizeMB}MB each)
            </p>
            <Button
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={openFileDialog}
              disabled={isUploading}
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Select files
            </Button>
          </div>
        </div>
      </Card>

      {/* File Errors */}
      {errors.length > 0 && (
        <div
          className="flex items-center gap-2 p-3 text-sm text-destructive bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          role="alert"
        >
          <AlertCircleIcon className="size-4 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-2">
            {files.map(
              (file: {
                id: Key | null | undefined;
                preview: string | undefined;
                file: {
                  name:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | null
                    | undefined;
                  size: number;
                  type: string;
                };
              }) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="aspect-square shrink-0 rounded bg-accent">
                      {file.file.type.startsWith("image/") ? (
                        <img
                          src={file.preview}
                          alt={file.file.name as string}
                          className="size-10 rounded-[inherit] object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-[inherit] bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-800">
                            PDF
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="truncate text-[13px] font-medium">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.file.size)} • {file.file.type}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                    onClick={() => removeFile(file.id as string)}
                    aria-label="Remove file"
                    disabled={isUploading}
                  >
                    <XIcon className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              )
            )}
          </div>

          {/* Action Buttons - Positioned at bottom of file list */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              size="lg" variant="outline"
            >
              {isUploading ? (
                <>
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload {files.length} receipt{files.length > 1 ? "s" : ""}
                </>
              )}
            </Button>

            {files.length > 1 && (
              <Button
                size="lg"
                variant="outline"
                onClick={clearFiles}
                disabled={isUploading}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}