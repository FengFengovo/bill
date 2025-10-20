import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function StatsPage() {
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
        {/* 页面标题 */}
        <h1 className="text-2xl font-bold">数据统计</h1>

        {/* 总览 */}
        <Card>
          <CardHeader>
            <CardTitle>本月概览</CardTitle>
            <CardDescription>2025年10月</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">总支出</span>
              <span className="text-2xl font-bold text-red-600">¥0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">总收入</span>
              <span className="text-2xl font-bold text-green-600">¥0.00</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-muted-foreground">结余</span>
              <span className="text-2xl font-bold">¥0.00</span>
            </div>
          </CardContent>
        </Card>

        {/* 分类统计 */}
        <Card>
          <CardHeader>
            <CardTitle>支出分类</CardTitle>
            <CardDescription>按类别统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无数据</p>
            </div>
          </CardContent>
        </Card>

        {/* 趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle>收支趋势</CardTitle>
            <CardDescription>最近7天</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无数据</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
