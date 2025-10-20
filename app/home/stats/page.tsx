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

interface CategoryStat {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

type TimePeriod = "week" | "month" | "year";

export default function StatsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseByCategory, setExpenseByCategory] = useState<CategoryStat[]>(
    []
  );
  const [incomeByCategory, setIncomeByCategory] = useState<CategoryStat[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");

  // 获取时间范围
  const getDateRange = useCallback((period: TimePeriod) => {
    const now = new Date();
    let startDate: Date;
    const endDate = new Date(now);

    switch (period) {
      case "week": {
        // 本周（周一到周日）
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周日为0，需要特殊处理
        startDate = new Date(now);
        startDate.setDate(now.getDate() - diff);
        break;
      }
      case "month": {
        // 本月
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      }
      case "year": {
        // 本年
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      }
    }

    // 格式化为 YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
    };
  }, []);

  // 获取时间段描述
  const getPeriodDescription = useCallback((period: TimePeriod) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    switch (period) {
      case "week":
        return "本周";
      case "month":
        return `${year}年${month}月`;
      case "year":
        return `${year}年`;
    }
  }, []);

  // 加载账单数据
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

      const { start, end } = getDateRange(timePeriod);

      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false });

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

      // 计算支出分类统计
      const expenseStats = calculateCategoryStats(
        data?.filter((b) => b.type === "expense") || [],
        expense
      );
      setExpenseByCategory(expenseStats);

      // 计算收入分类统计
      const incomeStats = calculateCategoryStats(
        data?.filter((b) => b.type === "income") || [],
        income
      );
      setIncomeByCategory(incomeStats);
    } catch (error) {
      console.error("加载账单失败:", error);
    } finally {
      setLoading(false);
    }
  }, [router, timePeriod, getDateRange]);

  // 计算分类统计
  const calculateCategoryStats = (
    bills: Bill[],
    total: number
  ): CategoryStat[] => {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    bills.forEach((bill) => {
      const current = categoryMap.get(bill.category) || { amount: 0, count: 0 };
      categoryMap.set(bill.category, {
        amount: current.amount + Number(bill.amount),
        count: current.count + 1,
      });
    });

    const stats: CategoryStat[] = [];
    categoryMap.forEach((value, category) => {
      stats.push({
        category,
        amount: value.amount,
        count: value.count,
        percentage: total > 0 ? (value.amount / total) * 100 : 0,
      });
    });

    // 按金额降序排序
    return stats.sort((a, b) => b.amount - a.amount);
  };

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // 格式化金额
  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-lg mx-auto p-4 flex items-center justify-center h-screen">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-lg mx-auto p-4 pb-20 space-y-4">
        {/* 页面标题 */}
        <h1 className="text-2xl font-bold">数据统计</h1>

        {/* 时间段选择 */}
        <div className="flex gap-2">
          <Button
            variant={timePeriod === "week" ? "default" : "outline"}
            onClick={() => setTimePeriod("week")}
            className="flex-1"
          >
            本周
          </Button>
          <Button
            variant={timePeriod === "month" ? "default" : "outline"}
            onClick={() => setTimePeriod("month")}
            className="flex-1"
          >
            本月
          </Button>
          <Button
            variant={timePeriod === "year" ? "default" : "outline"}
            onClick={() => setTimePeriod("year")}
            className="flex-1"
          >
            本年
          </Button>
        </div>

        {/* 总览 */}
        <Card>
          <CardHeader>
            <CardTitle>收支概览</CardTitle>
            <CardDescription>
              {getPeriodDescription(timePeriod)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">总支出</span>
              <span className="text-2xl font-bold text-red-600">
                ¥{formatAmount(totalExpense)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">总收入</span>
              <span className="text-2xl font-bold text-green-600">
                ¥{formatAmount(totalIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-muted-foreground">结余</span>
              <span
                className={`text-2xl font-bold ${
                  totalIncome - totalExpense >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ¥{formatAmount(totalIncome - totalExpense)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 支出分类统计 */}
        <Card>
          <CardHeader>
            <CardTitle>支出分类</CardTitle>
            <CardDescription>按类别统计</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <div className="space-y-4">
                {expenseByCategory.map((stat) => (
                  <div key={stat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                          {getCategoryIcon(stat.category)}
                        </div>
                        <span className="font-medium">
                          {getCategoryLabel(stat.category)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({stat.count}笔)
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">
                          ¥{formatAmount(stat.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stat.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    {/* 进度条 */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无支出数据</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 收入分类统计 */}
        <Card>
          <CardHeader>
            <CardTitle>收入分类</CardTitle>
            <CardDescription>按类别统计</CardDescription>
          </CardHeader>
          <CardContent>
            {incomeByCategory.length > 0 ? (
              <div className="space-y-4">
                {incomeByCategory.map((stat) => (
                  <div key={stat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                          {getCategoryIcon(stat.category)}
                        </div>
                        <span className="font-medium">
                          {getCategoryLabel(stat.category)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({stat.count}笔)
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ¥{formatAmount(stat.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stat.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    {/* 进度条 */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无收入数据</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 统计摘要 */}
        <Card>
          <CardHeader>
            <CardTitle>统计摘要</CardTitle>
            <CardDescription>
              {getPeriodDescription(timePeriod)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">总笔数</span>
              <span className="font-semibold">{bills.length}笔</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">支出笔数</span>
              <span className="font-semibold">
                {bills.filter((b) => b.type === "expense").length}笔
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">收入笔数</span>
              <span className="font-semibold">
                {bills.filter((b) => b.type === "income").length}笔
              </span>
            </div>
            {bills.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">平均支出</span>
                  <span className="font-semibold">
                    ¥
                    {formatAmount(
                      totalExpense /
                        bills.filter((b) => b.type === "expense").length || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">平均收入</span>
                  <span className="font-semibold">
                    ¥
                    {formatAmount(
                      totalIncome /
                        bills.filter((b) => b.type === "income").length || 0
                    )}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
