"use client";

import React, { useCallback, useState } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  className?: string;
}

export function ImageUploader({ value = [], onChange, maxFiles = 5, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (value.length + files.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    setIsUploading(true);
    
    try {
      const newStorageIds: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        // 1. Get an upload URL from Convex
        const postUrl = await generateUploadUrl();

        // 2. Upload the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        
        const { storageId } = await result.json();
        newStorageIds.push(storageId);
      }
      
      onChange([...value, ...newStorageIds]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (idToRemove: string) => {
    onChange(value.filter((id) => id !== idToRemove));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [value, maxFiles]);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors relative",
          isDragging 
            ? "border-brand-lime bg-brand-lime/5" 
            : "border-border-default hover:border-border-strong hover:bg-surface-hover"
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={isUploading || value.length >= maxFiles}
        />
        
        <div className="flex flex-col items-center text-center space-y-3 pointer-events-none">
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
              <div className="space-y-1">
                <p className="font-sans font-medium text-text-main">Uploading images...</p>
                <p className="font-sans text-xs text-text-muted">Please wait</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-brand-lime/10 flex items-center justify-center">
                <UploadCloud className="w-6 h-6 text-brand-lime" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-medium text-text-main">
                  Click or drag images here
                </p>
                <p className="font-sans text-xs text-text-muted">
                  SVG, PNG, JPG or GIF (max {maxFiles} images)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((storageId) => (
            <ImagePreview key={storageId} storageId={storageId} onRemove={() => removeImage(storageId)} />
          ))}
        </div>
      )}
    </div>
  );
}

import { Id } from "@/convex/_generated/dataModel";

function ImagePreview({ storageId, onRemove }: { storageId: string; onRemove: () => void }) {
  const url = useQuery(api.files.getFileUrl, { storageId: storageId as Id<"_storage"> });

  return (
    <div className="group relative aspect-video rounded-lg overflow-hidden border border-border-default bg-surface flex items-center justify-center">
      {url ? (
        <img src={url} alt="Uploaded venue" className="w-full h-full object-cover" />
      ) : (
        <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="p-2 bg-error rounded-full text-white hover:bg-error-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
