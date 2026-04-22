"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  type?: "image" | "video";
}

export default function FileUpload({
  onUploadComplete,
  currentUrl,
  label = "Upload File",
  accept = "image/*",
  maxSizeMB = 5,
  className,
  type = "image",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Ukuran ${type === "video" ? "video" : "foto"} maksimal ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", type === "video" ? "videos" : "uploads");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal upload");

      onUploadComplete(result.data.url);
      toast.success(`${type === "video" ? "Video" : "Foto"} berhasil diunggah`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-4">
        {currentUrl && type === "image" && (
          <div className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
            <img
              src={currentUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            className="text-[10px] w-full"
          >
            {uploading ? "Mengupload..." : label}
          </Button>
        </div>
      </div>
      
      <p className="text-[9px] text-charcoal-light/40 italic">
        *Maksimal {maxSizeMB}MB. {type === "video" ? "Gunakan resolusi HD." : "Format JPG, PNG, WebP."}
      </p>
    </div>
  );
}
