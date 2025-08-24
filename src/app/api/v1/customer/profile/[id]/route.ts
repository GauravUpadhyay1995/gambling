// src/app/api/v1/admin/users/profile/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Customer } from '@/models/Customer';
import { asyncHandler } from '@/lib/asyncHandler';

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    // Destructure params directly from the function parameter
    const { id: userId } = params;

    if (!userId) {
        return NextResponse.json({
            success: false,
            message: 'Customer ID is missing in route',
        }, { status: 400 });
    }

    const userProfile = await Customer.findById(userId).select('-password');
    if (!userProfile) {
        return NextResponse.json({
            success: false,
            message: 'Customer not found',
        }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        message: 'Customer fetched successfully',
        data: userProfile,
    });
})