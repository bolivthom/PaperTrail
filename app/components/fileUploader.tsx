"use client"

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react"
import { formatBytes, useFileUpload } from "~/hooks/use-file-upload"
import { Key, ReactElement, JSXElementConstructor, ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"



// Create some dummy initial files
const initialFiles = [
    // {
    //     name: "image-01.jpg",
    //     size: 1528737,
    //     type: "image/jpeg",
    //     url: "https://picsum.photos/1000/800?grayscale&random=1",
    //     id: "image-01-123456789",
    // },
    //   {
    //     name: "image-02.jpg",
    //     size: 2345678,
    //     type: "image/jpeg",
    //     url: "https://picsum.photos/1000/800?grayscale&random=2",
    //     id: "image-02-123456789",
    //   },
    //   {
    //     name: "image-03.jpg",
    //     size: 3456789,
    //     type: "image/jpeg",
    //     url: "https://picsum.photos/1000/800?grayscale&random=3",
    //     id: "image-03-123456789",
    //   },
]

export default function FileUploader() {
    const maxSizeMB = 5
    const maxSize = maxSizeMB * 1024 * 1024 // 5MB default
    const maxFiles = 6

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
        accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
        maxSize,
        multiple: true,
        maxFiles,
        initialFiles,
    })

    return (
        <div className="flex flex-col gap-2">
            {/* Drop area */}
            <Card className="w-full border border-border shadow-sm rounded-2xl bg-card">
                <CardHeader>
                    <CardTitle className="text-xl font-medium text-foreground">
                        Upload Receipt
                         <p className="text-sm text-muted-foreground mb-1">
                           AI powered receipt processing
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
                        aria-label="Upload image file"
                    />
                    <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                        <div
                            className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                            aria-hidden="true"
                        >
                            <ImageIcon className="size-4 opacity-60" />
                        </div>
                        <p className="mb-1.5 text-sm font-medium">Drop your receipts here</p>
                        <p className="text-xs text-muted-foreground">
                            PDF, PNG or JPG (max. {maxSizeMB}MB)
                        </p>
                        <Button className="mt-4 bg-primary text-primary-foreground hover:opacity-90" onClick={openFileDialog}>
                            <UploadIcon className="w-6 h-6"/>
                            Select images
                        </Button>
                    </div>
                </div>
            </Card>
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
                <div className="space-y-2">
                    {files.map((file: { id: Key | null | undefined; preview: string | undefined; file: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; size: number } }) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="aspect-square shrink-0 rounded bg-accent">
                                    <img
                                        src={file.preview}
                                        alt={file.file.name}
                                        className="size-10 rounded-[inherit] object-cover"
                                    />
                                </div>
                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <p className="truncate text-[13px] font-medium">
                                        {file.file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatBytes(file.file.size)}
                                    </p>
                                </div>
                            </div>

                            <Button
                                size="icon"
                                variant="primary"
                                className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                                onClick={() => removeFile(file.id)}
                                aria-label="Remove file"
                            >
                                <XIcon aria-hidden="true" />
                            </Button>
                        </div>
                    ))}

                    {/* Remove all files button */}
                    {files.length > 1 && (
                        <div>
                            <Button size="sm" variant="outline" onClick={clearFiles}>
                                Remove all files
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
