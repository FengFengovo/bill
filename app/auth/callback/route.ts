import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        new URL("/auth/login?error=配置错误，请联系管理员", requestUrl.origin)
      );
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,

      {
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
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 认证成功，重定向到指定页面或首页
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // 如果出错，重定向到登录页面并显示错误信息
  return NextResponse.redirect(
    new URL("/auth/login?error=认证失败，请重试", requestUrl.origin)
  );
}
