import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Event } from '@/models/Event';
import { asyncHandler } from '@/lib/asyncHandler';


export const GET =
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    // Early connection check (reused from connectToDB if implemented efficiently)
    await connectToDB();

    const eventId = params?.id;


    // Fetch event with lean and projection to reduce payload
    const event = await Event.findById(eventId)
      .lean() // Convert to plain JS object, avoiding Mongoose overhead
      .select('-__v -updatedAt') // Exclude unnecessary fields
      .exec();

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Event fetched successfully', data: event },
      { headers: { 'Cache-Control': 'public, max-age=300' } } // Cache response for 5 minutes
    );
  });
