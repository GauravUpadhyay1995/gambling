import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Rating } from '@/models/Rating';
import { asyncHandler } from '@/lib/asyncHandler';
import { Types } from 'mongoose';

export const PATCH = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const ratingId = params?.id;

    if (!Types.ObjectId.isValid(ratingId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid rating ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Update rating
    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      { ...body, updatedAt: new Date() }, // overwrite with new data
      { new: true, runValidators: true }  // return updated doc & validate
    )
      .lean()
      .select('-__v') // remove unwanted fields
      .exec();

    if (!updatedRating) {
      return NextResponse.json(
        { success: false, message: 'Rating not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Rating updated successfully',
        data: updatedRating,
      },
      { headers: { 'Cache-Control': 'no-store' } } // prevent stale caching
    );
  }
);
