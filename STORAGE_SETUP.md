# Supabase Storage 配置指南

本指南将帮助你在 Supabase 中配置存储桶（Storage Bucket），用于存储用户头像。

---

## 📋 配置步骤

### 1. 创建存储桶

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 在左侧菜单中点击 **Storage**
4. 点击 **New bucket** 按钮
5. 填写以下信息：
   - **Name**: `avatars`
   - **Public bucket**: ✅ 勾选（允许公开访问）
   - **File size limit**: `2MB`（可选）
   - **Allowed MIME types**: `image/*`（可选）
6. 点击 **Create bucket**

### 2. 配置存储策略（Policies）

为了让用户能够上传和访问头像，需要设置存储策略。

#### 方法 1：使用 SQL Editor（推荐）

1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New query**
3. 复制并执行以下 SQL：

```sql
-- 允许所有人查看头像（公开读取）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 允许认证用户上传自己的头像
CREATE POLICY "User Upload Own Avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许用户更新自己的头像
CREATE POLICY "User Update Own Avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许用户删除自己的头像
CREATE POLICY "User Delete Own Avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 方法 2：使用 Storage UI

1. 在 **Storage** 页面，点击 `avatars` 存储桶
2. 点击 **Policies** 标签
3. 点击 **New policy**
4. 选择模板或自定义策略：

**公开读取策略：**

- Policy name: `Public Access`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'avatars'`

**用户上传策略：**

- Policy name: `User Upload Own Avatar`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`

### 3. 验证配置

执行以下 SQL 查询验证策略是否创建成功：

```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

---

## 🔧 代码实现

### 上传头像

```typescript
const { data, error } = await supabase.storage
  .from("avatars")
  .upload(`avatars/${userId}-${Date.now()}.jpg`, file, {
    cacheControl: "3600",
    upsert: false,
  });
```

### 获取公开 URL

```typescript
const {
  data: { publicUrl },
} = supabase.storage.from("avatars").getPublicUrl(filePath);
```

### 更新用户元数据

```typescript
const { error } = await supabase.auth.updateUser({
  data: {
    avatar_url: publicUrl,
  },
});
```

### 获取用户头像

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
const avatarUrl = user?.user_metadata?.avatar_url;
```

---

## 📁 文件结构

```
avatars/
├── {user_id}-{timestamp}.jpg
├── {user_id}-{timestamp}.png
└── ...
```

每个用户的头像文件名格式：`{user_id}-{timestamp}.{ext}`

---

## 🔒 安全性说明

### 当前策略的安全性

1. **公开读取**：所有人都可以查看头像（适合公开资料）
2. **认证上传**：只有登录用户才能上传
3. **用户隔离**：用户只能管理自己的头像文件

### 文件路径验证

策略使用 `storage.foldername(name))[1]` 来提取文件路径中的用户 ID，确保：

- 文件路径必须是 `avatars/{user_id}-xxx.jpg` 格式
- 用户只能上传到以自己 ID 命名的文件

### 建议的安全措施

1. **文件大小限制**：在存储桶设置中限制为 2MB
2. **文件类型限制**：只允许图片类型（`image/*`）
3. **客户端验证**：在上传前验证文件类型和大小
4. **服务端验证**：使用 Edge Functions 进行额外验证（可选）

---

## 🧪 测试步骤

### 1. 测试上传功能

1. 运行项目：`npm run dev`
2. 访问 http://localhost:3000/profile
3. 点击头像，选择图片上传
4. 检查是否上传成功

### 2. 验证存储桶

1. 打开 Supabase Dashboard → Storage → avatars
2. 查看是否有新上传的文件
3. 点击文件，复制 URL
4. 在浏览器中打开 URL，验证是否可以访问

### 3. 验证用户元数据

在 SQL Editor 中执行：

```sql
SELECT
  id,
  email,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users
WHERE id = 'your-user-id';
```

---

## ❌ 常见问题

### 问题 1：上传失败 - "new row violates row-level security policy"

**原因**：存储策略未正确配置

**解决方案**：

1. 检查策略是否已创建
2. 确认文件路径格式正确（`avatars/{user_id}-xxx.jpg`）
3. 确认用户已登录（`auth.uid()` 不为空）

### 问题 2：无法访问图片 URL

**原因**：存储桶未设置为公开

**解决方案**：

1. 打开 Storage → avatars
2. 点击 Settings
3. 确认 **Public bucket** 已勾选

### 问题 3：上传后头像不显示

**原因**：用户元数据未更新或组件未刷新

**解决方案**：

1. 检查 `updateUser` 是否成功
2. 确认 `onAvatarUpdate` 回调被调用
3. 刷新页面重新获取用户数据

### 问题 4：文件大小超限

**原因**：文件超过 2MB

**解决方案**：

1. 在客户端压缩图片
2. 提示用户选择更小的图片
3. 使用图片压缩库（如 `browser-image-compression`）

---

## 🚀 进阶功能

### 1. 图片压缩

安装依赖：

```bash
npm install browser-image-compression
```

使用示例：

```typescript
import imageCompression from "browser-image-compression";

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 800,
  useWebWorker: true,
};

const compressedFile = await imageCompression(file, options);
```

### 2. 图片裁剪

使用 `react-image-crop` 库实现裁剪功能：

```bash
npm install react-image-crop
```

### 3. 删除旧头像

在上传新头像前删除旧头像：

```typescript
// 从 URL 中提取文件路径
const oldPath = user.avatar_url?.split("/").slice(-2).join("/");
if (oldPath) {
  await supabase.storage.from("avatars").remove([oldPath]);
}
```

### 4. 头像缓存

使用 CDN 或添加缓存控制头：

```typescript
const { data } = await supabase.storage.from("avatars").upload(filePath, file, {
  cacheControl: "31536000", // 1 年
  upsert: false,
});
```

---

## 📚 相关文档

- [Supabase Storage 官方文档](https://supabase.com/docs/guides/storage)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)

---

## ✅ 配置检查清单

- [ ] 创建 `avatars` 存储桶
- [ ] 设置存储桶为公开（Public bucket）
- [ ] 创建公开读取策略（Public Access）
- [ ] 创建用户上传策略（User Upload Own Avatar）
- [ ] 创建用户更新策略（User Update Own Avatar）
- [ ] 创建用户删除策略（User Delete Own Avatar）
- [ ] 测试上传功能
- [ ] 验证图片可以公开访问
- [ ] 验证用户元数据已更新

---

完成以上配置后，用户就可以在个人资料页面上传和更换头像了！🎉
