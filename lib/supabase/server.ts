import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 创建服务器端 Supabase 客户端
 * 用于服务器组件、Server Actions 和 Route Handlers
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file or Vercel environment variables."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 在 Server Component 中调用时可能会失败
          // 这是预期行为，可以忽略
        }
      },
    },
  });
}
