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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddBillDialog } from "@/components/add-bill-dialog";
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
  created_at: string;
}

export default function BillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // 获取当前月份
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const monthStart = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-01`;
      const monthEnd = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-31`;

      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .gte("date", monthStart)
        .lte("date", monthEnd)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("加载账单失败:", error);
        return;
      }

      setBills(data || []);

      // 计算总收入和总支出
      const income =
        data
          ?.filter((b) => b.type === "income")
          .reduce((sum, b) => sum + Number(b.amount), 0) || 0;
      const expense =
        data
          ?.filter((b) => b.type === "expense")
          .reduce((sum, b) => sum + Number(b.amount), 0) || 0;

      setTotalIncome(income);
      setTotalExpense(expense);
    } catch (error) {
      console.error("加载账单失败:", error);
    } finally {
      setLoading(false);
    }
  }, [router, currentYear, currentMonth]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // 格式化金额
  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

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
      food: <Utensils className="w-5 h-5" />,
      transport: <Car className="w-5 h-5" />,
      shopping: <ShoppingBag className="w-5 h-5" />,
      entertainment: <Gamepad2 className="w-5 h-5" />,
      housing: <Home className="w-5 h-5" />,
      medical: <Heart className="w-5 h-5" />,
      education: <GraduationCap className="w-5 h-5" />,
      // 收入分类
      salary: <Wallet className="w-5 h-5" />,
      bonus: <DollarSign className="w-5 h-5" />,
      investment: <TrendingUp className="w-5 h-5" />,
      gift: <Gift className="w-5 h-5" />,
      // 其他
      other: <MoreHorizontal className="w-5 h-5" />,
    };
    return iconMap[category] || <MoreHorizontal className="w-5 h-5" />;
  };

  if (loading) {
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
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">我的账单</h1>
          <AddBillDialog onSuccess={loadBills}>
            <Button>+ 记账</Button>
          </AddBillDialog>
        </div>

        {/* 月份统计 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {currentYear}年{currentMonth}月
            </CardTitle>
            <CardDescription>
              支出 ¥{formatAmount(totalExpense)} | 收入 ¥
              {formatAmount(totalIncome)}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 账单列表 */}
        <Card>
          <CardHeader>
            <CardTitle>账单明细</CardTitle>
          </CardHeader>
          <CardContent>
            {bills && bills.length > 0 ? (
              <div className="space-y-3">
                {bills.map((bill: Bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          bill.type === "expense"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {getCategoryIcon(bill.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {getCategoryLabel(bill.category)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(bill.date)}
                          </Badge>
                        </div>
                        {bill.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {bill.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={`text-lg font-semibold ${
                        bill.type === "expense"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {bill.type === "expense" ? "-" : "+"}¥
                      {formatAmount(Number(bill.amount))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">暂无账单记录</p>
                <p className="text-sm mb-4">开始记录你的第一笔账单吧</p>
                <AddBillDialog onSuccess={loadBills}>
                  <Button>立即记账</Button>
                </AddBillDialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
