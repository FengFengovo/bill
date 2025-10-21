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

  // 在开发环境中进行检查
  if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
    console.error("Missing Supabase environment variables");
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
    console.error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
      supabaseAnonKey ? "exists" : "missing"
    );
  }

  return createBrowserClient(supabaseUrl || "", supabaseAnonKey || "");
}
