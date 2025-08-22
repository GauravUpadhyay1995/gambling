import { NextRequest, NextResponse } from 'next/server';
import {verifyAdmin}  from '@/lib/verifyAdmin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. No admin token found.',
        },
        { status: 401 }
      );
    }

    const { data, nextResponse } = await verifyAdmin(
      `${API_BASE_URL}/dashboard`,
      {},
      token,
      'admin_token'
    );

    if (nextResponse) return nextResponse;

    return NextResponse.json(
      {
        success: true,
        message: data?.message || 'Dashboard data fetched successfully',
        data: data?.data
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
