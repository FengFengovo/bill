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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UsernameForm } from "@/components/username-form";
import { PasswordForm } from "@/components/password-form";

// 强制动态渲染
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-lg mx-auto p-4 pb-24 space-y-4">
        {/* 返回按钮 */}
        <Button variant="ghost" asChild>
          <Link href="/home/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
        </Button>

        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold">账户设置</h1>
          <p className="text-muted-foreground">管理你的个人信息</p>
        </div>

        {/* 用户名设置 */}
        <Card>
          <CardHeader>
            <CardTitle>用户名</CardTitle>
            <CardDescription>
              设置你的显示名称，其他用户将看到这个名字
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsernameForm
              userId={user.id}
              currentUsername={user.user_metadata?.username || ""}
            />
          </CardContent>
        </Card>

        {/* 密码修改 */}
        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>定期修改密码可以提高账户安全性</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>

        {/* 邮箱信息（只读） */}
        <Card>
          <CardHeader>
            <CardTitle>邮箱地址</CardTitle>
            <CardDescription>你的登录邮箱</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm">{user.email}</span>
              <span className="text-xs text-muted-foreground">不可修改</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
