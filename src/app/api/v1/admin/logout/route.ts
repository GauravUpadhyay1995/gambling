import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ success: true,
    message: 'Logged out successfully',
   });

  response.cookies.set('admin_token', '', { 
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  })

  response.cookies.set('token', '', { 
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  })

  return response
} 