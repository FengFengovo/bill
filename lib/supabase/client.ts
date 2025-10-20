import { createBrowserClient } from "@supabase/ssr";

/**
 * 创建浏览器端 Supabase 客户端
 * 用于客户端组件中访问 Supabase
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
