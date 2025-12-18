import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin/dashboard');
      const isAuthRoute = nextUrl.pathname.startsWith('/admin/login');

      if (isAdminRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub; 
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; 
      }
      return token;
    },
  },
  providers: [], // Providers are configured in auth.ts to avoid edge runtime issues
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;