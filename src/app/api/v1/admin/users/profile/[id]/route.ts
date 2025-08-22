// src/app/api/v1/admin/users/profile/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { User } from '@/models/User';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import {verifyAdmin}  from '@/lib/verifyAdmin';

export const GET = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    // Destructure params directly from the function parameter
    const { id: userId } = params;

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is missing in route',
      }, { status: 400 });
    }

    const userProfile = await User.findById(userId).select('-password');
    if (!userProfile) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User fetched successfully',
      data: userProfile,
    });
  })
);