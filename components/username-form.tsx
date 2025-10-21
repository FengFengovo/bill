"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UsernameFormProps {
  userId: string;
  currentUsername: string;
}

export function UsernameForm({ userId, currentUsername }: UsernameFormProps) {
  const [username, setUsername] = useState(currentUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证用户名
    if (!username.trim()) {
      toast.error("用户名不能为空");
      return;
    }

    if (username.length < 2) {
      toast.error("用户名至少需要 2 个字符");
      return;
    }

    if (username.length > 20) {
      toast.error("用户名不能超过 20 个字符");
      return;
    }

    // 验证用户名格式（只允许中文、英文、数字、下划线）
    const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      toast.error("用户名只能包含中文、英文、数字和下划线");
      return;
    }

    // 显示确认对话框
    setShowConfirmDialog(true);
  };

  const confirmUpdate = async () => {
    setIsLoading(true);
    setShowConfirmDialog(false);

    try {
      // 更新用户元数据
      const { error } = await supabase.auth.updateUser({
        data: {
          username: username.trim(),
        },
      });

      if (error) {
        throw error;
      }

      toast.success("用户名更新成功！");

      // 跳转到"我的"页面
      router.push("/home/profile");
      router.refresh();
    } catch (error) {
      console.error("更新失败:", error);
      toast.error("用户名更新失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUsername(currentUsername);
  };

  const hasChanged = username !== currentUsername;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            disabled={isLoading}
            maxLength={20}
          />
          <p className="text-xs text-muted-foreground">
            2-20 个字符，支持中文、英文、数字和下划线
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!hasChanged || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "保存修改"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanged || isLoading}
          >
            重置
          </Button>
        </div>
      </form>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认修改用户名</AlertDialogTitle>
            <AlertDialogDescription>
              确认要将用户名从{" "}
              <span className="font-semibold text-foreground">
                "{currentUsername}"
              </span>{" "}
              修改为{" "}
              <span className="font-semibold text-foreground">
                "{username.trim()}"
              </span>{" "}
              吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpdate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "确认修改"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
