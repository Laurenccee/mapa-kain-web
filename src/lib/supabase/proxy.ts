import { ROUTES } from "@/utils/constants/routes";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (path === ROUTES.RESET_PASSWORD) {
    const token = request.nextUrl.searchParams.get("code");
    if (!token) {
      return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url));
    }
    return supabaseResponse;
  }

  const AUTH_ROUTES = [
    ROUTES.ROOT,
    ROUTES.SIGN_IN,
    ROUTES.SIGN_UP,
    ROUTES.FORGET_PASSWORD,
    ROUTES.EMAIL_VERIFICATION,
    ROUTES.RESET_PASSWORD,
  ];
  const PUBLIC_ROUTES = [ROUTES.MAP, ROUTES.FEED];

  if (!user) {
    if (
      path === ROUTES.MAP_SOURCE ||
      path.startsWith(ROUTES.API) ||
      path.startsWith("/scanner-barebone") ||
      path.startsWith("/_next") ||
      path.startsWith("/static") ||
      path.includes("style") ||
      path.endsWith(".json")
    ) {
      return NextResponse.next();
    }

    if (!AUTH_ROUTES.includes(path) && !PUBLIC_ROUTES.includes(path)) {
      return NextResponse.redirect(new URL(ROUTES.MAP, request.url));
    }
    return supabaseResponse;
  }

  if (user) {
    if (AUTH_ROUTES.includes(path)) {
      return NextResponse.redirect(new URL(ROUTES.MAP, request.url));
    }
    if (path !== ROUTES.PROFILE_SETUP) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        return NextResponse.redirect(
          new URL(ROUTES.PROFILE_SETUP, request.url),
        );
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
