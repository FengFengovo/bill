"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null);
  const router = useRouter();

  // 在客户端初始化 Supabase 客户端
  useEffect(() => {
    setSupabase(createClient());
  }, []);

  // 检查用户是否已登录
  useEffect(() => {
    if (!supabase) {
      return;
    }

    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 用户已登录，跳转到 home 页面
          router.push("/home");
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("检查登录状态失败:", error);
        setCheckingAuth(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      return;
    }
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`登录失败: ${error.message}`);
      setMessageType("error");
      setLoading(false);
    } else {
      setMessage("登录成功！");
      setMessageType("success");
      router.push("/home");
      router.refresh();
    }
  };

  const handleSignUp = async () => {
    if (!supabase) {
      return;
    }
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("两次输入的密码不一致，请重新输入");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("密码长度至少为6位");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email,
        },
      },
    });

    if (error) {
      setMessage(`注册失败: ${error.message}`);
      setMessageType("error");
      setLoading(false);
    } else {
      // 注册成功，提示用户查看邮箱确认
      setMessage(
        "注册成功！我们已向您的邮箱发送了一封确认邮件，请查看邮箱并点击链接完成注册。"
      );
      setMessageType("success");
      setLoading(false);
    }
  };

  // 正在检查登录状态时显示加载界面
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">正在检查登录状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUpMode ? "创建新账户" : "欢迎回来"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUpMode
              ? "填写信息创建你的账户"
              : "登录到你的账户或创建一个新账户"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                {!isSignUpMode && (
                  <ForgotPasswordDialog>
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                    >
                      忘记密码？
                    </button>
                  </ForgotPasswordDialog>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  isSignUpMode ? "new-password" : "current-password"
                }
                required
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isSignUpMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder=""
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

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

            <div className="space-y-2">
              {!isSignUpMode ? (
                <>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "处理中..." : "登录"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        或者
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(true);
                      setMessage("");
                    }}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    创建新账户
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={handleSignUp}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "处理中..." : "确认注册"}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(false);
                      setConfirmPassword("");
                      setMessage("");
                    }}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    返回登录
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
