"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/avatar-upload";

interface UserProfile {
  id: string;
  email: string | undefined;
  created_at: string;
  last_sign_in_at: string | null | undefined;
  email_confirmed_at: string | null | undefined;
  avatar_url?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/auth/login");
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        email_confirmed_at: authUser.email_confirmed_at,
        avatar_url: authUser.user_metadata?.avatar_url,
      });
      setLoading(false);
    };

    fetchUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("已成功退出登录");
    router.push("/");
    router.refresh();
  };

  const handleCopyId = () => {
    if (user) {
      navigator.clipboard.writeText(user.id);
      toast.success("用户 ID 已复制到剪贴板");
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setUser((prev) => (prev ? { ...prev, avatar_url: url } : null));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold">用户资料</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            查看你的账户信息和认证状态
          </p>
        </div>

        {/* 用户信息卡片 */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-4">
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={user.avatar_url}
                userEmail={user.email}
                onAvatarUpdate={handleAvatarUpdate}
              />
              <div>
                <CardTitle className="text-2xl text-white">
                  {user.email}
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  {user.email_confirmed_at ? (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-0"
                    >
                      ✓ 邮箱已确认
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500/20 text-white border-0"
                    >
                      ⚠ 邮箱未确认
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* 用户 ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">用户 ID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 bg-muted rounded-md text-sm font-mono break-all">
                  {user.id}
                </code>
                <Button onClick={handleCopyId} variant="outline" size="sm">
                  复制
                </Button>
              </div>
            </div>

            <Separator />

            {/* 邮箱地址 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱地址</label>
              <div className="px-4 py-2 bg-muted rounded-md">{user.email}</div>
            </div>

            <Separator />

            {/* 注册时间 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">注册时间</label>
              <div className="px-4 py-2 bg-muted rounded-md">
                {new Date(user.created_at).toLocaleString("zh-CN")}
              </div>
            </div>

            <Separator />

            {/* 最后登录时间 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">最后登录时间</label>
              <div className="px-4 py-2 bg-muted rounded-md">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString("zh-CN")
                  : "从未登录"}
              </div>
            </div>

            <Separator />

            {/* 邮箱确认时间 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱确认时间</label>
              <div className="px-4 py-2 bg-muted rounded-md">
                {user.email_confirmed_at
                  ? new Date(user.email_confirmed_at).toLocaleString("zh-CN")
                  : "未确认"}
              </div>
            </div>

            <Separator />

            {/* 操作按钮 */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1"
              >
                返回首页
              </Button>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="flex-1"
              >
                退出登录
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 提示信息卡片 */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              💡 如何在 Supabase 中查看用户数据？
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>
                <strong>方法 1：</strong> 打开 Supabase 仪表板 → Authentication
                → Users
              </li>
              <li>
                <strong>方法 2：</strong> SQL Editor 中运行：
                <code className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                  SELECT * FROM auth.users
                </code>
              </li>
              <li>
                <strong>方法 3：</strong> Table Editor → 切换 Schema 为
                &quot;auth&quot; → 选择 users 表
              </li>
            </ul>
            <Button
              asChild
              variant="link"
              className="mt-4 p-0 h-auto text-blue-600 dark:text-blue-400"
            >
              <a href="/HOW_TO_VIEW_USERS.md" target="_blank">
                查看完整指南 →
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
