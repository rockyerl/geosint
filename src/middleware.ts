import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "sundawa_session";

function getAuthSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "sundawa-dev-secret-super-secure-key-32-chars-long!";
  return new TextEncoder().encode(secret);
}

// Route permission mappings for pre-flight routing protection
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard/users": "users.read",
  "/dashboard/roles": "roles.read",
  "/dashboard/reports": "reports.view",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let sessionPayload: { roleCode?: string; permissions?: string[] } | null = null;

  if (token) {
    try {
      const secretKey = getAuthSecretKey();
      const { payload } = await jwtVerify(token, secretKey);
      sessionPayload = payload as { roleCode?: string; permissions?: string[] };
    } catch {
      sessionPayload = null;
    }
  }

  // 1. If accessing /login while already authenticated -> redirect to /dashboard
  if (pathname === "/login") {
    if (sessionPayload) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Allow root / for GEOSINT demonstration portal
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 3. Protected admin routes under /dashboard (e.g. /dashboard/users, /dashboard/roles)
  if (
    pathname.startsWith("/dashboard/users") ||
    pathname.startsWith("/dashboard/roles") ||
    pathname.startsWith("/dashboard/reports")
  ) {
    if (!sessionPayload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check specific path permissions
    for (const [routePrefix, requiredPerm] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(routePrefix)) {
        const isSuperAdmin = sessionPayload.roleCode === "SUPER_ADMIN";
        const hasPerm = sessionPayload.permissions?.includes(requiredPerm);
        if (!isSuperAdmin && !hasPerm) {
          return NextResponse.redirect(new URL("/dashboard/forbidden", request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
