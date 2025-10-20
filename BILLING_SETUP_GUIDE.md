# 记账功能配置指南

## 1. 创建数据库表

在 Supabase Dashboard 中执行以下步骤：

1. 进入 **SQL Editor**
2. 点击 **New Query**
3. 复制 `supabase-bills-table.sql` 文件中的所有内容
4. 点击 **Run** 执行

这将创建：

- `bills` 表（账单表）
- 必要的索引
- 自动更新时间戳的触发器
- RLS（行级安全）策略

## 2. 验证表创建

在 **Table Editor** 中应该能看到 `bills` 表，包含以下字段：

| 字段名      | 类型          | 说明                   |
| ----------- | ------------- | ---------------------- |
| id          | UUID          | 主键                   |
| user_id     | UUID          | 用户 ID（外键）        |
| type        | VARCHAR(10)   | 类型（income/expense） |
| amount      | DECIMAL(10,2) | 金额                   |
| category    | VARCHAR(50)   | 分类                   |
| description | TEXT          | 备注                   |
| date        | DATE          | 日期                   |
| created_at  | TIMESTAMP     | 创建时间               |
| updated_at  | TIMESTAMP     | 更新时间               |

## 3. 验证 RLS 策略

在 **Authentication** → **Policies** 中应该能看到 4 个策略：

- ✅ Users can view own bills
- ✅ Users can create own bills
- ✅ Users can update own bills
- ✅ Users can delete own bills

## 4. 使用记账功能

### 4.1 打开记账对话框

在以下位置可以打开记账对话框：

- 首页的"记一笔"按钮
- 首页的"立即记账"链接
- 账单页面的"+ 记账"按钮
- 账单页面的"立即记账"按钮

### 4.2 填写表单

1. **选择类型**：支出或收入
2. **输入金额**：必填，支持小数点后两位
3. **选择分类**：必填，根据类型显示不同分类
4. **选择日期**：默认今天，可修改
5. **添加备注**：可选

### 4.3 支出分类

- 餐饮
- 交通
- 购物
- 娱乐
- 住房
- 医疗
- 教育
- 其他

### 4.4 收入分类

- 工资
- 奖金
- 投资
- 礼金
- 其他

## 5. 功能特性

✅ 对话框形式，无需跳转页面
✅ 表单验证（金额、分类必填）
✅ 自动保存到数据库
✅ 保存成功后自动刷新页面
✅ 友好的错误提示
✅ 加载状态显示
✅ 数据安全（RLS 保护）

## 6. 常见问题

### Q: 记账失败怎么办？

A: 检查以下几点：

1. 确认已执行 SQL 脚本创建表
2. 确认 RLS 策略已启用
3. 确认用户已登录
4. 检查浏览器控制台错误信息

### Q: 如何修改分类？

A: 编辑 `components/add-bill-dialog.tsx` 文件中的 `EXPENSE_CATEGORIES` 和 `INCOME_CATEGORIES` 常量。

### Q: 如何查看已保存的账单？

A: 目前账单已保存到数据库，后续会添加账单列表展示功能。

## 7. 下一步开发

- [ ] 显示账单列表
- [ ] 编辑账单
- [ ] 删除账单
- [ ] 按月份筛选
- [ ] 统计图表
- [ ] 导出数据
