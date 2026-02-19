"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  onFilesSelected: (files: FileList) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  accept?: string;
};

export default function FileDropzone({
  onFilesSelected,
  maxFiles = 2,
  maxSizeMb = 5,
  accept = "image/*",
}: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) {
          onFilesSelected(e.dataTransfer.files);
        }
      }}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/30"
      )}
    >
      {/* Hidden file input */}
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            onFilesSelected(e.target.files);
          }
        }}
      />

      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-sm">
        <Upload className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Text */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Drag & drop files here</p>
        <p className="text-xs text-muted-foreground">
          Or click to browse (max {maxFiles} files, up to {maxSizeMb}MB each)
        </p>
      </div>

      {/* Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>
    </div>
  );
}
