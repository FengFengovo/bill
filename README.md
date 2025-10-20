# Next.js + Supabase + shadcn/ui 项目

这是一个使用 Next.js 15、Supabase 和 shadcn/ui 构建的现代化 Web 应用模板。

## ✨ 功能特性

- ✅ **Next.js 15** - 最新的 React 框架
- ✅ **Supabase 认证** - 完整的用户注册、登录、邮箱验证
- ✅ **shadcn/ui** - 精美的 UI 组件库
- ✅ **TypeScript** - 类型安全
- ✅ **Tailwind CSS v4** - 现代化样式
- ✅ **用户头像上传** - 支持自定义头像 🆕
- ✅ **响应式设计** - 完美适配移动端和桌面端
- ✅ **深色模式支持** - 自动适配系统主题

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 配置 Supabase Storage（用于头像上传）

在 Supabase Dashboard 中：

1. 创建存储桶：Storage → New bucket → 名称：`avatars`，勾选 Public bucket
2. 配置策略：SQL Editor → 执行 `supabase-storage-policies.sql` 文件内容

详细步骤请查看：[STORAGE_SETUP.md](./STORAGE_SETUP.md)

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
next-bill/
├── app/                        # Next.js App Router
│   ├── auth/
│   │   ├── callback/          # 认证回调处理
│   │   ├── login/             # 登录/注册页面
│   │   └── success/           # 注册成功页面
│   ├── profile/               # 用户资料页面
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 首页
├── components/
│   ├── ui/                    # shadcn/ui 组件
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── avatar-upload.tsx      # 头像上传组件 🆕
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # 客户端 Supabase 实例
│   │   ├── server.ts          # 服务端 Supabase 实例
│   │   └── middleware.ts      # 认证中间件
│   └── utils.ts               # 工具函数
├── supabase-storage-policies.sql  # 存储策略 SQL 🆕
├── STORAGE_SETUP.md           # 存储配置指南 🆕
├── AVATAR_UPLOAD_GUIDE.md     # 头像上传使用指南 🆕
└── components.json            # shadcn/ui 配置
```

## 🎨 已安装的 UI 组件

- Avatar - 头像组件
- Badge - 徽章组件
- Button - 按钮组件
- Card - 卡片组件
- Dialog - 对话框组件 🆕
- Input - 输入框组件
- Label - 标签组件
- Separator - 分隔线组件
- Sonner - Toast 通知组件

### 添加更多组件

```bash
npx shadcn@latest add [component-name]
```

查看所有可用组件：https://ui.shadcn.com/docs/components

## 📖 功能说明

### 用户认证

- **注册**：邮箱 + 密码注册，自动发送验证邮件
- **登录**：支持邮箱密码登录
- **邮箱验证**：点击邮件链接完成验证
- **回调处理**：自动处理认证回调和会话创建

### 用户资料

- **查看资料**：显示用户 ID、邮箱、注册时间等信息
- **头像上传**：支持上传自定义头像 🆕
  - 支持 JPG、PNG、GIF 等图片格式
  - 文件大小限制 2MB
  - 实时预览
  - 自动保存到 Supabase Storage
  - 多设备同步

### 头像上传功能 🆕

#### 使用方法

1. 登录账户
2. 访问个人资料页面（/profile）
3. 点击头像（悬停时显示相机图标）
4. 选择图片并预览
5. 点击"确认上传"
6. 上传成功后头像立即更新

#### 技术实现

- 使用 Supabase Storage 存储头像文件
- 头像 URL 保存在用户元数据中
- 支持文件类型和大小验证
- 使用 shadcn/ui Dialog 组件实现上传界面
- 集成 lucide-react 图标库

详细使用指南：[AVATAR_UPLOAD_GUIDE.md](./AVATAR_UPLOAD_GUIDE.md)

## 🔧 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 添加 shadcn/ui 组件
npx shadcn@latest add [component-name]
```

## 📚 文档

- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - Supabase Storage 详细配置指南
- [AVATAR_UPLOAD_GUIDE.md](./AVATAR_UPLOAD_GUIDE.md) - 头像上传功能使用指南
- [SHADCN_UI_GUIDE.md](./SHADCN_UI_GUIDE.md) - shadcn/ui 使用指南
- [SHADCN_UI_SUMMARY.md](./SHADCN_UI_SUMMARY.md) - shadcn/ui 集成总结

## 🔒 安全性

### 认证安全

- 使用 Supabase Auth 进行用户认证
- 支持邮箱验证
- 使用 HTTP-only cookies 存储会话
- 自动刷新访问令牌

### 存储安全

- 使用 Row Level Security (RLS) 策略
- 用户只能上传和管理自己的头像
- 公开读取，认证写入
- 文件路径验证，防止越权访问

## 🌐 部署

### Vercel（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署

### 其他平台

确保设置正确的环境变量，并支持 Next.js 15 的 App Router。

## 🛠️ 技术栈

- **框架**：Next.js 15 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS v4
- **UI 组件**：shadcn/ui
- **后端服务**：Supabase
  - Authentication
  - Storage
  - Database (PostgreSQL)
- **图标**：lucide-react
- **通知**：Sonner

## 📝 待办事项

- [ ] 添加密码重置功能
- [ ] 添加用户资料编辑功能
- [ ] 实现图片压缩和裁剪
- [ ] 添加社交登录（Google、GitHub 等）
- [ ] 创建仪表板页面
- [ ] 添加数据表格展示
- [ ] 实现搜索和筛选功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

## 🎉 开始使用

1. ✅ 克隆项目
2. ✅ 安装依赖：`npm install`
3. ✅ 配置环境变量：`.env.local`
4. ✅ 配置 Supabase Storage（如需头像上传）
5. ✅ 启动开发服务器：`npm run dev`
6. ✅ 访问 http://localhost:3000

**祝你开发愉快！🚀**
