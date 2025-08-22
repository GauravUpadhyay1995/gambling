import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Event } from '@/models/Event';
import { uploadBufferToS3, deleteFromS3 } from '@/lib/uploadToS3';
import { Types } from 'mongoose';
import {verifyAdmin}  from '@/lib/verifyAdmin';

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string, imageId: string } }) => {
    await connectToDB();
    const { id: eventId, imageId } = params;
    console.log("eventId, imageId", eventId, imageId)

    if (!Types.ObjectId.isValid(eventId) || !Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ success: false, message: 'Invalid IDs' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Image file is required' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    const imageIndex = event.images.findIndex((img: any) => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return NextResponse.json({ success: false, message: 'Image not found in event' }, { status: 404 });
    }

    // Upload new image
    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await uploadBufferToS3(buffer, file.type, file.name, 'events');

    if (!upload?.url) {
      return NextResponse.json({ success: false, message: 'Image upload failed' }, { status: 500 });
    }

    // Delete old image from S3
    await deleteFromS3(event.images[imageIndex].url, 'events');

    // Replace with new image data
    event.images[imageIndex] = {
      url: upload.url,
      mimetype: file.type,
      size: file.size,
    };

    event.updatedBy = (req as any).user.id;

    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Image updated successfully',
      data: event.toObject(),
    });
  })
);

export const DELETE = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string, imageId: string } }) => {
    await connectToDB();
    const { id:eventId, imageId } = params;

    if (!Types.ObjectId.isValid(eventId) || !Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ success: false, message: 'Invalid IDs' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    const imageIndex = event.images.findIndex((img: any) => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return NextResponse.json({ success: false, message: 'Image not found in event' }, { status: 404 });
    }

    const imageToRemove = event.images[imageIndex];

    // Remove from array
    event.images.splice(imageIndex, 1);

    await deleteFromS3(imageToRemove.url,'events'); // ✅ Remove from S3
    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      data: event.toObject(),
    });
  })
);
