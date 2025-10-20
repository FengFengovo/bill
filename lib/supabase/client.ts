import { createBrowserClient } from "@supabase/ssr";

/**
 * 创建浏览器端 Supabase 客户端
 * 用于客户端组件中访问 Supabase
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file or Vercel environment variables."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
