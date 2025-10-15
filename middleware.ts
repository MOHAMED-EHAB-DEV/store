import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const protectedRoutes = [
    "/dashboard",
    "/favourites",
];
const adminRoutes = ["/admin"];

function isProtectedRoute(pathname: string) {
    return protectedRoutes.some((route) => pathname.includes(route));
}

function isAdminRoute(pathname: string) {
    return adminRoutes.some((route) => pathname.includes(route));
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = req.cookies.get("token")?.value;

    if (
        (pathname.includes("/login") || pathname.includes("/register")) &&
        token
    ) {
        return NextResponse.redirect(
            new URL(`/dashboard`, req.url)
        );
    }

    const reLogin = () => {
        if (process.env.DisableAuth) return NextResponse.next();
        // Redirect to login page if not authenticated
        const response = NextResponse.redirect(
            new URL(
                "/signin",
                req.url
            )
        );
        response.cookies.delete("token");
        return response;
    };

    if (isProtectedRoute(pathname)) {
        if (!token) return reLogin();
        try {
            const userResponse = await fetch(
                new URL('/api/user', req.nextUrl.origin),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const userData = await userResponse.json();
            if (!userData.user?._id) return reLogin();
        } catch (error) {
            return reLogin();
        }
    }

    if (isAdminRoute(pathname)) {
        if (!token) return reLogin();
        try {
            const userResponse = await fetch(
                new URL('/api/user', req.nextUrl.origin),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const userData = await userResponse.json();
            if (!userData.user?._id || userData.user?.role !== "admin") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        } catch (error) {
            return reLogin();
        }
    }

    return NextResponse.next();
}
