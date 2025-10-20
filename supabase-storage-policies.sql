-- =====================================================
-- Supabase Storage 策略配置脚本
-- 用途：为 avatars 存储桶配置访问策略
-- 使用方法：在 Supabase SQL Editor 中执行此脚本
-- =====================================================

-- 1. 允许所有人查看头像（公开读取）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 2. 允许认证用户上传自己的头像
CREATE POLICY "User Upload Own Avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. 允许用户更新自己的头像
CREATE POLICY "User Update Own Avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. 允许用户删除自己的头像
CREATE POLICY "User Delete Own Avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 验证策略是否创建成功
-- =====================================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%Avatar%';

-- =====================================================
-- 说明
-- =====================================================
-- 1. Public Access: 允许任何人查看头像图片
-- 2. User Upload Own Avatar: 用户只能上传到以自己 ID 命名的文件
-- 3. User Update Own Avatar: 用户只能更新自己的头像
-- 4. User Delete Own Avatar: 用户只能删除自己的头像
--
-- 文件路径格式：avatars/{user_id}-{timestamp}.{ext}
-- 例如：avatars/123e4567-e89b-12d3-a456-426614174000-1234567890.jpg
-- =====================================================
