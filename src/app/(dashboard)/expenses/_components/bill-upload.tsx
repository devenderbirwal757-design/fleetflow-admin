"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface BillUploadProps {
  onUpload: (url: string | null) => void;
  defaultValue?: string | null;
}

export function BillUpload({ onUpload, defaultValue }: BillUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("expense-bills")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("expense-bills").getPublicUrl(path);

      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    setPreview(null);
    onUpload(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Bill / Receipt</label>

      {preview ? (
        <div className="flex items-center gap-3 rounded-md border px-3 py-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 truncate text-sm">Bill uploaded</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFile}
            disabled={uploading}
            className="h-9"
          />
          {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
        </div>
      )}
    </div>
  );
}
