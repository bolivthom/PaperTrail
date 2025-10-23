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


export default function FileUploader() {
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB
  const maxFiles = 6;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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

  // const handleUpload = async () => {
  //   if (files.length === 0) {
  //     setUploadStatus({
  //       type: "error",
  //       message: "Please select at least one file to upload",
  //     });
  //     return;
  //   }

  //   setIsUploading(true);
  //   setUploadStatus(null);

  //   try {
  //     const uploadPromises = files.map(async (fileWithPreview) => {
  //       const file = fileWithPreview.file as File;
  //       const formData = new FormData();
  //       formData.append("image", file);

  //       const response = await fetch("/api/receipt", {
  //         method: "POST",
  //         body: formData,
  //       });

  //       if (!response.ok) {
  //         throw new Error(`Upload failed for ${file.name}: ${response.status}`);
  //       }

  //       return response.json();
  //     });

  //     await Promise.all(uploadPromises);
  //     setUploadStatus({
  //       type: "success",
  //       message: `Successfully uploaded ${files.length} receipt(s)`,
  //     });
  //     clearFiles();
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     setUploadStatus({
  //       type: "error",
  //       message:
  //         error instanceof Error
  //           ? error.message
  //           : "Upload failed. Please try again.",
  //     });
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  // const handleUpload = async () => {
  //   if (files.length === 0) {
  //     setUploadStatus({
  //       type: "error",
  //       message: "Please select at least one file to upload",
  //     });
  //     return;
  //   }

  //   setIsUploading(true);
  //   setUploadStatus(null);

  //   try {
  //     const results = await Promise.allSettled(
  //       files.map(async (fileWithPreview) => {
  //         const file = fileWithPreview.file as File;
  //         const formData = new FormData();
  //         formData.append("image", file);

  //         const response = await fetch("/api/receipt", {
  //           method: "POST",
  //           body: formData,
  //         });

  //         if (!response.ok) {
  //           // Parse the error response to get the actual message
  //           let errorMessage = `Upload failed for ${file.name}`;
  //           try {
  //             const errorData = await response.json();
  //             if (errorData.message) {
  //               errorMessage = errorData.message;
  //             }
  //           } catch (parseError) {
  //             errorMessage = `Upload failed for ${file.name}: ${response.statusText}`;
  //           }
  //           throw new Error(errorMessage);
  //         }

  //         return { file: file.name, data: await response.json() };
  //       })
  //     );

  //     const succeeded = results.filter((r) => r.status === "fulfilled");
  //     const failed = results.filter((r) => r.status === "rejected");

  //     if (failed.length === 0) {
  //       // All succeeded
  //       setUploadStatus({
  //         type: "success",
  //         message: `Successfully uploaded ${succeeded.length} receipt(s)`,
  //       });
  //       clearFiles();
  //     } else if (succeeded.length === 0) {
  //       // All failed
  //       const firstError = failed[0].status === "rejected" ? failed[0].reason : null;
  //       setUploadStatus({
  //         type: "error",
  //         message:
  //           firstError instanceof Error
  //             ? firstError.message
  //             : "All uploads failed. Please try again.",
  //       });
  //     } else {
  //       // Some succeeded, some failed
  //       const firstError = failed[0].status === "rejected" ? failed[0].reason : null;
  //       const errorMsg = firstError instanceof Error ? firstError.message : "Unknown error";

  //       setUploadStatus({
  //         type: "error",
  //         message: `${succeeded.length} receipt(s) uploaded successfully, but ${failed.length} failed: ${errorMsg}`,
  //       });

  //       // Remove only the successfully uploaded files
  //       const successfulFileIds = succeeded
  //         .map((r) => r.status === "fulfilled" ? r.value.file : null)
  //         .filter(Boolean);

  //       // This would require modifying your removeFile logic to handle bulk removal
  //       // For now, you might want to just clear all files on partial success
  //       // clearFiles();
  //     }

  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     setUploadStatus({
  //       type: "error",
  //       message:
  //         error instanceof Error
  //           ? error.message
  //           : "Upload failed. Please try again.",
  //     });
  //     clearFiles(); // ✅ Clear files even on error
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  // Add this to your component state at the top
  const [dismissTimeout, setDismissTimeout] = useState<NodeJS.Timeout | null>(null);

  // Then modify the handleUpload function:
  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus({
        type: "error",
        message: "Please select at least one file to upload",
      });
      return;
    }

    // Clear any existing timeout
    if (dismissTimeout) {
      clearTimeout(dismissTimeout);
      setDismissTimeout(null);
    }

    setIsUploading(true);
    setUploadStatus(null);

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
        setUploadStatus({
          type: "success",
          message: `Successfully uploaded ${succeeded.length} receipt(s)`,
        });
        clearFiles();

        const timeout = setTimeout(() => {
          setUploadStatus(null);
          setDismissTimeout(null);
        }, 5000);
        setDismissTimeout(timeout);
      } else if (succeeded.length === 0) {
        // All failed
        const firstError = failed[0].status === "rejected" ? failed[0].reason : null;
        setUploadStatus({
          type: "error",
          message:
            firstError instanceof Error
              ? firstError.message
              : "All uploads failed. Please try again.",
        });
        clearFiles();

        const timeout = setTimeout(() => {
          setUploadStatus(null);
          setDismissTimeout(null);
        }, 8000);
        setDismissTimeout(timeout);
      } else {
        // Some succeeded, some failed
        const firstError = failed[0].status === "rejected" ? failed[0].reason : null;
        const errorMsg = firstError instanceof Error ? firstError.message : "Unknown error";

        setUploadStatus({
          type: "error",
          message: `${succeeded.length} receipt(s) uploaded successfully, but ${failed.length} failed: ${errorMsg}`,
        });

        clearFiles();

        const timeout = setTimeout(() => {
          setUploadStatus(null);
          setDismissTimeout(null);
        }, 10000);
        setDismissTimeout(timeout);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again.",
      });
      clearFiles();

      const timeout = setTimeout(() => {
        setUploadStatus(null);
        setDismissTimeout(null);
      }, 8000);
      setDismissTimeout(timeout);
    } finally {
      setIsUploading(false);
    }
  };

  // And add cleanup on unmount
  useEffect(() => {
    return () => {
      if (dismissTimeout) {
        clearTimeout(dismissTimeout);
      }
    };
  }, [dismissTimeout]);

  
  return (
    <div className="flex flex-col gap-4">
      {/* Drop area */}
      <Card className="w-full border border-border shadow-sm rounded-2xl bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-foreground">
            Upload Receipt
            <p className="text-sm text-muted-foreground mb-1">
              AI powered receipt processing
            </p>
            {/* WARNING AGAINST OTHER CURRENCIES*/}
            <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-2 flex items-center gap-1">
              <AlertCircleIcon className="w-3 h-3" />
              Currently only JMD currency receipts are supported
            </p>
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
              className="mt-4 bg-primary text-primary-foreground hover:opacity-90"
              onClick={openFileDialog}
              disabled={isUploading}
            >
              <UploadIcon className="w-6 h-6" />
              Select files
            </Button>
          </div>
        </div>
      </Card>

      {/* Upload Status */}
      {/* {uploadStatus && (
        <div
          className={`p-3 rounded-lg ${uploadStatus.type === "success"
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
      )} */}

      {/* Upload Status */}
      {uploadStatus && (
        <div
          className={`p-4 rounded-lg ${uploadStatus.type === "success"
            ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
            : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
            }`}
        >
          <div className="flex items-start gap-2">
            {uploadStatus.type === "success" ? (
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <AlertCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {uploadStatus.message.includes("Currency Not Supported")
                  ? "Currency Not Supported"
                  : uploadStatus.type === "success" ? "Success" : "Upload Failed"}
              </p>
              <p className="text-sm mt-1">
                {uploadStatus.message}
              </p>
              {uploadStatus.message.includes("Currency Not Supported") && (
                <p className="text-xs mt-2 opacity-90">
                  💡 Tip: Please upload receipts in JMD (Jamaican Dollars) only. We're working on multi-currency support!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Errors */}
      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} receipt${files.length > 1 ? "s" : ""}`
              )}
            </Button>

            {files.length > 1 && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearFiles}
                disabled={isUploading}
              >
                Clear all
              </Button>
            )}
          </div>
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
        </div>
      )}
    </div>
  );
}
