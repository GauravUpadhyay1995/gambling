import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { connectToDB } from '@/config/mongo';
import { Event } from '@/models/Event';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { updateEventSchema } from '@/lib/validations/market.schema';
import { Types } from 'mongoose';
import {verifyAdmin}  from '@/lib/verifyAdmin';

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();
    const user = (req as any).user;
    const eventId = params.id;

    if (!Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ success: false, message: 'Invalid event ID' }, { status: 400 });
    }

    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const rawBody: any = {};
    for (const [key, value] of formData.entries()) {
      rawBody[key] = value;
    }

    if (rawBody.startDate) rawBody.startDate = new Date(rawBody.startDate);
    if (rawBody.endDate) rawBody.endDate = new Date(rawBody.endDate);

    const imageFiles = formData.getAll('images') as File[];
    delete rawBody.images;

    const { error, value } = updateEventSchema.validate(rawBody, { abortEarly: false });
    if (error) {
      const formattedErrors = error.details.reduce((acc, curr) => {
        acc[curr.path[0] as string] = curr.message;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
        data: null,
      }, { status: 400 });
    }

    let newImageMetaData: {
      url: string;
      mimetype: string;
      size: number;
    }[] = [];

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await uploadBufferToS3(buffer, file.type, file.name, 'events');

        if (upload?.url) {
          newImageMetaData.push({
            url: upload.url,
            mimetype: file.type,
            size: file.size,
          });
        }
      }
    }

    value.images = [
      ...(existingEvent.images || []),
      ...newImageMetaData,
    ];

    value.updatedBy = new Types.ObjectId(user.id);

    const updated = await Event.findByIdAndUpdate(eventId, value, { new: true });

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: updated?.toObject(),
    });
  })
);
