"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AddBillDialog } from "@/components/add-bill-dialog";
import type { User } from "@supabase/supabase-js";
import {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Home,
  Heart,
  GraduationCap,
  MoreHorizontal,
  Wallet,
  Gift,
  TrendingUp,
  DollarSign,
} from "lucide-react";

interface Bill {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);

      // 获取当前月份
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const monthStart = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-01`;
      const monthEnd = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-31`;

      // 加载本月账单
      const { data: bills } = await supabase
        .from("bills")
        .select("*")
        .gte("date", monthStart)
        .lte("date", monthEnd)
        .order("created_at", { ascending: false });

      if (bills) {
        // 计算总收入和总支出
        const income = bills
          .filter((b) => b.type === "income")
          .reduce((sum, b) => sum + Number(b.amount), 0);
        const expense = bills
          .filter((b) => b.type === "expense")
          .reduce((sum, b) => sum + Number(b.amount), 0);

        setTotalIncome(income);
        setTotalExpense(expense);
        setRecentBills(bills.slice(0, 5));
      }
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 获取分类中文名称
  const getCategoryLabel = (category: string) => {
    const labelMap: Record<string, string> = {
      // 支出分类
      food: "餐饮",
      transport: "交通",
      shopping: "购物",
      entertainment: "娱乐",
      housing: "住房",
      medical: "医疗",
      education: "教育",
      // 收入分类
      salary: "工资",
      bonus: "奖金",
      investment: "投资",
      gift: "礼金",
      // 其他
      other: "其他",
    };
    return labelMap[category] || category;
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      // 支出分类
      food: <Utensils className="w-4 h-4" />,
      transport: <Car className="w-4 h-4" />,
      shopping: <ShoppingBag className="w-4 h-4" />,
      entertainment: <Gamepad2 className="w-4 h-4" />,
      housing: <Home className="w-4 h-4" />,
      medical: <Heart className="w-4 h-4" />,
      education: <GraduationCap className="w-4 h-4" />,
      // 收入分类
      salary: <Wallet className="w-4 h-4" />,
      bonus: <DollarSign className="w-4 h-4" />,
      investment: <TrendingUp className="w-4 h-4" />,
      gift: <Gift className="w-4 h-4" />,
      // 其他
      other: <MoreHorizontal className="w-4 h-4" />,
    };
    return iconMap[category] || <MoreHorizontal className="w-4 h-4" />;
  };

  if (loading || !user) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-lg mx-auto p-4 flex items-center justify-center h-screen">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-full">
      <div className="max-w-lg mx-auto p-4 pb-20 space-y-4">
        {/* 快速统计 */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>本月支出</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                ¥{totalExpense.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>本月收入</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                ¥{totalIncome.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-3">
            <AddBillDialog onSuccess={loadData}>
              <Button size="lg" className="h-20">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">+</span>
                  <span>记一笔</span>
                </div>
              </Button>
            </AddBillDialog>
          </CardContent>
        </Card>

        {/* 最近账单 */}
        <Card>
          <CardHeader>
            <CardTitle>最近账单</CardTitle>
            <CardDescription>
              {recentBills.length > 0
                ? `最近${recentBills.length}条记录`
                : "暂无账单记录"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentBills.length > 0 ? (
              <div className="space-y-3">
                {recentBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          bill.type === "expense"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {getCategoryIcon(bill.category)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {getCategoryLabel(bill.category)}
                        </div>
                        {bill.description && (
                          <div className="text-xs text-muted-foreground">
                            {bill.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`font-semibold ${
                        bill.type === "expense"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {bill.type === "expense" ? "-" : "+"}¥
                      {Number(bill.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/home/bills">查看全部</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>还没有账单记录</p>
                <AddBillDialog onSuccess={loadData}>
                  <Button variant="link" className="mt-2">
                    立即记账
                  </Button>
                </AddBillDialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
