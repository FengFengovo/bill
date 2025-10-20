"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const next = searchParams.get("next") || "/home";
      router.push(next);
    }
  }, [countdown, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          {/* 成功图标 */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <svg
              className="h-10 w-10 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <CardTitle className="text-3xl">注册成功！</CardTitle>
            <CardDescription className="mt-2">
              你的账户已经创建成功，现在可以开始使用了
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 用户信息 */}
          {user && (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">欢迎你，</p>
                <Badge variant="secondary" className="text-base px-4 py-1">
                  {user.email}
                </Badge>
              </div>
              <Separator />
            </>
          )}

          {/* 倒计时 */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <span className="text-2xl font-bold text-primary">
                {countdown}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {countdown} 秒后自动跳转...
            </p>
          </div>

          <Separator />

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                const next = searchParams.get("next") || "/home";
                router.push(next);
              }}
              className="w-full"
              size="lg"
            >
              立即开始使用
            </Button>

            <Button
              onClick={() => router.push("/home")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              进入主页
            </Button>
          </div>

          {/* 额外提示 */}
          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground">
              💡 提示：你可以随时在设置中修改个人信息
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
