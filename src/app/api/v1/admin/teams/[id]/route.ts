// src/app/api/v1/admin/users/profile/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Team } from '@/models/Team';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const teamId = params?.id;
    if (!teamId) {
      return NextResponse.json(
        { success: false, message: 'Team ID is missing in route' },
        { status: 400 }
      );
    }

    const team = await Team.findById(teamId).lean(); // ✅ Use lean for faster performance
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team fetched successfully',
      data: team,
    });
  })