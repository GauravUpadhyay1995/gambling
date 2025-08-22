import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Trl } from '@/models/Trl';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';

export const GET =   asyncHandler(async (_req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const { id: trlId } = params || {};

    if (!trlId?.trim()) {
      return NextResponse.json(
        { success: false, message: 'TRL ID is missing in route' },
        { status: 400 }
      );
    }

    const trl = await Trl.findById(trlId).lean();

    if (!trl) {
      return NextResponse.json(
        { success: false, message: 'TRL not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'TRL fetched successfully',
      data: trl,
    });
  })