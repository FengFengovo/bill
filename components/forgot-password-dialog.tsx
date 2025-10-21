"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordDialogProps {
  children: React.ReactNode;
}

const COOLDOWN_TIME = 60; // 冷却时间60秒
const COOLDOWN_KEY = "password_reset_cooldown";

export function ForgotPasswordDialog({ children }: ForgotPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [cooldown, setCooldown] = useState(0);
  const supabase = createClient();

  // 检查冷却时间
  useEffect(() => {
    const checkCooldown = () => {
      const lastSentTime = localStorage.getItem(COOLDOWN_KEY);
      if (lastSentTime) {
        const elapsed = Math.floor(
          (Date.now() - parseInt(lastSentTime)) / 1000
        );
        const remaining = COOLDOWN_TIME - elapsed;
        if (remaining > 0) {
          setCooldown(remaining);
        } else {
          localStorage.removeItem(COOLDOWN_KEY);
          setCooldown(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 倒计时
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 检查冷却时间
    if (cooldown > 0) {
      setMessage(`请等待 ${cooldown} 秒后再试`);
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!email) {
      setMessage("请输入邮箱地址");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("请输入有效的邮箱地址");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      // 直接发送重置邮件
      // Supabase 会自动验证邮箱是否存在
      // 出于安全考虑，即使邮箱不存在也会返回成功（防止邮箱枚举攻击）
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        // 检查是否是频率限制错误
        if (error.message.includes("rate limit")) {
          setMessage("发送过于频繁，请稍后再试");
          // 设置冷却时间
          localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
          setCooldown(COOLDOWN_TIME);
        } else {
          setMessage(`发送失败: ${error.message}`);
        }
        setMessageType("error");
      } else {
        setMessage("如果该邮箱已注册，您将收到密码重置邮件，请查看您的邮箱。");
        setMessageType("success");
        // 设置冷却时间
        localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
        setCooldown(COOLDOWN_TIME);
        // 3秒后关闭对话框
        setTimeout(() => {
          setOpen(false);
          setEmail("");
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      setMessage("发送失败，请稍后重试");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // 关闭时重置状态
      setEmail("");
      setMessage("");
      setMessageType("success");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>找回密码</DialogTitle>
          <DialogDescription>
            输入您的邮箱地址，我们将发送密码重置链接到您的邮箱
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">邮箱地址</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {message && (
            <div
              className={`text-sm text-center p-3 rounded-md ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || cooldown > 0}
              className="flex-1"
            >
              {loading
                ? "发送中..."
                : cooldown > 0
                ? `请等待 ${cooldown}秒`
                : "发送重置链接"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
