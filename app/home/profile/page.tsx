import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
import { AvatarUpload } from "@/components/avatar-upload";

import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";

// 强制动态渲染，避免构建时预渲染导致环境变量缺失
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* 用户信息卡片 */}
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={user.user_metadata?.avatar_url}
              />
              <div className="text-center">
                <CardTitle className="text-xl mb-1">
                  {user.user_metadata?.username || user.email?.split("@")[0]}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  {user.email}
                  {user.email_confirmed_at && (
                    <Badge variant="default" className="text-xs">
                      已认证
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 账户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">用户ID</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {user.id.slice(0, 8)}...
              </code>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">注册时间</span>
              <span className="text-sm">
                {new Date(user.created_at).toLocaleDateString("zh-CN")}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">最后登录</span>
              <span className="text-sm">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString("zh-CN")
                  : "未知"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 功能菜单 */}
        <Card>
          <CardHeader>
            <CardTitle>功能设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link href="/home/profile/settings">
                <span>账户设置</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link href="/home/profile/about">
                <span>关于我们</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* 退出登录 */}
        <Card>
          <CardContent className="pt-6">
            <form action="/auth/signout" method="post">
              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
