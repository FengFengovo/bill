-- 创建账单表
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS bills_user_id_idx ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS bills_date_idx ON public.bills(date);
CREATE INDEX IF NOT EXISTS bills_type_idx ON public.bills(type);
CREATE INDEX IF NOT EXISTS bills_category_idx ON public.bills(category);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- 用户只能查看自己的账单
CREATE POLICY "Users can view own bills"
  ON public.bills
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建自己的账单
CREATE POLICY "Users can create own bills"
  ON public.bills
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的账单
CREATE POLICY "Users can update own bills"
  ON public.bills
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的账单
CREATE POLICY "Users can delete own bills"
  ON public.bills
  FOR DELETE
  USING (auth.uid() = user_id);
