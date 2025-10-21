import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * 创建中间件 Supabase 客户端
 * 用于在 middleware 中处理认证和会话管理
 */
export async function updateSession(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Missing Supabase environment variables. Please check your .env.local file or Vercel environment variables."
      );
      return NextResponse.next({
        request,
      });
    }

    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // 刷新会话（如果过期）
    // 重要：不要移除此行，它确保用户的认证状态保持最新
    await supabase.auth.getUser();

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    // 即使出错也返回正常响应，避免500错误
    return NextResponse.next({
      request,
    });
  }
}
