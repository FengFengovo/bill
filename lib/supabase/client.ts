import { createBrowserClient } from "@supabase/ssr";

/**
 * 创建浏览器端 Supabase 客户端
 * 用于客户端组件中访问 Supabase
 */
export function createClient() {
  // 在浏览器环境中，Next.js 会将 NEXT_PUBLIC_ 前缀的环境变量注入到代码中
  // 这些值在构建时被替换为实际的字符串
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // 如果环境变量缺失，抛出错误
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file or Vercel environment variables."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
