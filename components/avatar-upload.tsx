"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Upload, Camera } from "lucide-react";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  userEmail?: string;
  onAvatarUpdate?: (url: string) => void;
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  userEmail,
  onAvatarUpdate,
}: AvatarUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    // 验证文件大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast.error("图片大小不能超过 2MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("请先选择图片");
      return;
    }

    setUploading(true);

    try {
      // 生成唯一的文件名
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`; // 使用 userId/filename 格式以符合 RLS 策略

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 获取公开 URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 更新用户元数据
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("头像上传成功！");
      onAvatarUpdate?.(publicUrl);
      setOpen(false);
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("上传失败:", error);
      toast.error("头像上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <Avatar className="h-20 w-20 border-4 border-white/20">
            {currentAvatarUrl ? (
              <AvatarImage src={currentAvatarUrl} alt="用户头像" />
            ) : null}
            <AvatarFallback className="text-2xl bg-white text-indigo-600">
              {userEmail?.[0].toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传头像</DialogTitle>
          <DialogDescription>
            选择一张图片作为你的头像（最大 2MB）
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* 预览区域 */}
          <div className="flex justify-center">
            <Avatar className="h-32 w-32 border-4 border-gray-200">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="预览" />
              ) : currentAvatarUrl ? (
                <AvatarImage src={currentAvatarUrl} alt="当前头像" />
              ) : null}
              <AvatarFallback className="text-4xl">
                {userEmail?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* 文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              className="flex-1"
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              选择图片
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1"
            >
              {uploading ? "上传中..." : "确认上传"}
            </Button>
          </div>

          {/* 提示信息 */}
          <p className="text-xs text-muted-foreground text-center">
            支持 JPG、PNG、GIF 格式，文件大小不超过 2MB
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
