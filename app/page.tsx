import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Home() {
  const supabase = await createClient();

  // 获取当前用户信息（如果已登录）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-4xl mx-auto space-y-8">
        {/* Logo */}
        <div className="flex justify-center sm:justify-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
        </div>

        {/* Supabase 连接状态卡片 */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Supabase 连接状态
              {user ? (
                <Badge variant="default" className="bg-green-600">
                  已连接
                </Badge>
              ) : (
                <Badge variant="secondary">未登录</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {user
                ? "您已成功登录并连接到 Supabase"
                : "Supabase 已配置，请登录以继续"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    {user.user_metadata?.avatar_url ? (
                      <AvatarImage
                        src={user.user_metadata.avatar_url}
                        alt="用户头像"
                      />
                    ) : null}
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {user.email?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-muted-foreground">
                      欢迎回来！
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      用户 ID:
                    </span>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {user.id}
                    </code>
                  </div>
                </div>

                <Separator />
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href="/profile">查看资料</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/auth/login">退出登录</Link>
                  </Button>
                </div>
              </>
            ) : (
              <Button asChild className="w-full">
                <Link href="/auth/login">登录 / 注册</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 快速开始指南 */}
        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>按照以下步骤配置您的应用</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>
                  配置 Supabase：编辑{" "}
                  <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">
                    .env.local
                  </code>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>添加你的 Supabase URL 和 Anon Key</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>开始构建你的应用！</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <Button asChild size="lg" className="flex-1">
            <a
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="dark:invert mr-2"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
              />
              Deploy now
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <a
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read our docs
            </a>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 flex gap-6 flex-wrap items-center justify-center text-sm text-muted-foreground">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
