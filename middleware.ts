/**
 * @module Middleware
 * @description Protection des routes ERP + redirection par rôle
 */
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const role = token?.role as string | undefined

    // VENDEUR → uniquement /erp/vente-place
    if (role === 'VENDEUR' && path.startsWith('/erp') && !path.startsWith('/erp/vente-place')) {
      return NextResponse.redirect(new URL('/erp/vente-place', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/erp/:path*']
}
