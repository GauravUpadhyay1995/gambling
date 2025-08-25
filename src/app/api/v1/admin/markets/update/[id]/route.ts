import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Market } from '@/models/Market';
import { asyncHandler } from '@/lib/asyncHandler';
import { Types } from 'mongoose';

export const PATCH = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const marketId = params?.id;

    if (!Types.ObjectId.isValid(marketId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid market ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Update market
    const updatedMarket = await Market.findByIdAndUpdate(
      marketId,
      { ...body, updatedAt: new Date() }, // overwrite with new data
      { new: true, runValidators: true }  // return updated doc & validate
    )
      .lean()
      .select('-__v') // remove unwanted fields
      .exec();

    if (!updatedMarket) {
      return NextResponse.json(
        { success: false, message: 'Market not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Market updated successfully',
        data: updatedMarket,
      },
      { headers: { 'Cache-Control': 'no-store' } } // prevent stale caching
    );
  }
);
