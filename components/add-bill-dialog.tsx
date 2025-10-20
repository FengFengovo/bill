"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// 支出分类
const EXPENSE_CATEGORIES = [
  { value: "food", label: "餐饮" },
  { value: "transport", label: "交通" },
  { value: "shopping", label: "购物" },
  { value: "entertainment", label: "娱乐" },
  { value: "housing", label: "住房" },
  { value: "medical", label: "医疗" },
  { value: "education", label: "教育" },
  { value: "other", label: "其他" },
];

// 收入分类
const INCOME_CATEGORIES = [
  { value: "salary", label: "工资" },
  { value: "bonus", label: "奖金" },
  { value: "investment", label: "投资" },
  { value: "gift", label: "礼金" },
  { value: "other", label: "其他" },
];

interface AddBillDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function AddBillDialog({ children, onSuccess }: AddBillDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) {
      toast.error("请填写必填项");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("请输入有效的金额");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("请先登录");
        return;
      }

      const { error } = await supabase.from("bills").insert({
        user_id: user.id,
        type,
        amount: amountNum,
        category,
        description: description || null,
        date,
      });

      if (error) {
        throw error;
      }

      toast.success("记账成功");
      setOpen(false);

      // 重置表单
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);

      // 刷新页面数据
      router.refresh();

      // 调用回调函数
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("记账失败:", error);
      toast.error("记账失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>记一笔</DialogTitle>
          <DialogDescription>记录你的收入或支出</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* 类型选择 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                onClick={() => {
                  setType("expense");
                  setCategory("");
                }}
              >
                支出
              </Button>
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                onClick={() => {
                  setType("income");
                  setCategory("");
                }}
              >
                收入
              </Button>
            </div>

            {/* 金额 */}
            <div className="grid gap-2">
              <Label htmlFor="amount">
                金额 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* 分类 */}
            <div className="grid gap-2">
              <Label htmlFor="category">
                分类 <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 日期 */}
            <div className="grid gap-2">
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* 备注 */}
            <div className="grid gap-2">
              <Label htmlFor="description">备注</Label>
              <Textarea
                id="description"
                placeholder="添加备注（可选）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
