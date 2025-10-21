"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
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

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证当前密码
    if (!currentPassword.trim()) {
      toast.error("请输入当前密码");
      return;
    }

    // 验证新密码
    if (!newPassword.trim()) {
      toast.error("请输入新密码");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("新密码至少需要 6 个字符");
      return;
    }

    if (newPassword.length > 72) {
      toast.error("新密码不能超过 72 个字符");
      return;
    }

    // 验证新密码强度（至少包含字母和数字）
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("新密码必须包含字母和数字");
      return;
    }

    // 验证确认密码
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致");
      return;
    }

    // 验证新密码不能与当前密码相同
    if (currentPassword === newPassword) {
      toast.error("新密码不能与当前密码相同");
      return;
    }

    // 显示确认对话框
    setShowDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setShowDialog(false);
    setIsLoading(true);

    try {
      // 先验证当前密码是否正确
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) {
        throw new Error("无法获取用户信息");
      }

      // 尝试使用当前密码重新登录以验证密码正确性
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("当前密码不正确");
        setIsLoading(false);
        return;
      }

      // 更新密码
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success("密码修改成功！即将跳转到登录页面...");

      // 清空表单
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // 退出登录
      await supabase.auth.signOut();

      // 跳转到登录页面
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("密码修改失败:", error);
      toast.error("密码修改失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const hasInput = currentPassword || newPassword || confirmPassword;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">当前密码</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="请输入当前密码"
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">新密码</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码"
              disabled={isLoading}
              maxLength={72}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            6-72 个字符，必须包含字母和数字
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认新密码</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              disabled={isLoading}
              maxLength={72}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!hasInput || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                修改中...
              </>
            ) : (
              "修改密码"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasInput || isLoading}
          >
            重置
          </Button>
        </div>
      </form>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认修改密码</AlertDialogTitle>
            <AlertDialogDescription>
              你确定要修改密码吗？修改后需要使用新密码登录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUpdate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  修改中...
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
