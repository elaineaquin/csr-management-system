import { NextRequest, NextResponse } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';
import { Session } from '@/lib/auth';

const authRoutes = ['/sign-in', '/sign-up'];
const passwordRoutes = ['/reset-password', '/forgot-password'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/'];

export default async function authMiddleware(request: NextRequest) {
	const pathName = request.nextUrl.pathname;
	const isAuthRoute = authRoutes.includes(pathName);
	const isPasswordRoute = passwordRoutes.includes(pathName);
	const isAdminRoute = adminRoutes.includes(pathName);
	const isPublicRoute = publicRoutes.includes(pathName);

	const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
		baseURL: process.env.BETTER_AUTH_URL,
		headers: {
			cookie: request.headers.get('cookie') || '',
		},
	});

	if (!session) {
		if (isAuthRoute || isPasswordRoute || isPublicRoute) {
			return NextResponse.next();
		}
		return NextResponse.redirect(new URL('/sign-in', request.url));
	}

	if (isAuthRoute || isPasswordRoute) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	if (isAdminRoute && !session.user.role?.split(',').includes('admin')) {
		return NextResponse.redirect(new URL('/unauthorized', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
