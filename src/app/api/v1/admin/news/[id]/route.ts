// src/app/api/v1/admin/news/profile/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { News } from '@/models/News';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import mongoose from 'mongoose';

export const GET =  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const newsId = params.id;

    //  Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(newsId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid News ID format' },
        { status: 400 }
      );
    }

    //  Use .lean() to improve read performance (returns plain JS object)
    const newsProfile = await News.findById(newsId).lean();

    if (!newsProfile) {
      return NextResponse.json(
        { success: false, message: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'News fetched successfully',
      data: newsProfile,
    });
  })