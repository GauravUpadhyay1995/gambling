import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { connectToDB } from '@/config/mongo';
import { Event } from '@/models/Event';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { createEventSchema } from '@/lib/validations/market.schema';
import { Types } from 'mongoose';
import {verifyAdmin}  from '@/lib/verifyAdmin';

type CreateEventBody = {
  title: string;
  description: string;
  venue: string;
  images?: {
    url: string;
    mimetype: string;
    size: number;
    _id?: string;
  }[];
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
};

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const user = (req as any).user;
    const formData = await req.formData();

    const rawBody: any = {};
    for (const [key, value] of formData.entries()) {
      rawBody[key] = value;
    }

    // Convert date strings to Date objects
    if (rawBody.startDate && typeof rawBody.startDate === 'string') {
      rawBody.startDate = new Date(rawBody.startDate);
    }
    if (rawBody.endDate && typeof rawBody.endDate === 'string') {
      rawBody.endDate = new Date(rawBody.endDate);
    }

    const imageFiles = formData.getAll('images') as File[];
    delete rawBody.images;

    // ✅ Validate input
    const { error, value } = createEventSchema.validate(rawBody, { abortEarly: false });
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

    // ✅ Upload files & construct image metadata array
    let imageMetaData: {
      url: string;
      mimetype: string;
      size: number;
    }[] = [];

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await uploadBufferToS3(buffer, file.type, file.name, 'events');

        if (upload?.url) {
          imageMetaData.push({
            url: upload.url,
            mimetype: file.type,
            size: file.size,
          });
        } else {
          console.error(`Upload failed for ${file.name}`);
        }
      }
    }

    const eventData: CreateEventBody = {
      ...value,
      images: imageMetaData.length > 0 ? imageMetaData : undefined,
      isActive: rawBody.isActive === 'true',
      createdBy: new Types.ObjectId(user.id),
      updatedBy: new Types.ObjectId(user.id),
    };

    const created = await createEvent(eventData);

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      data: created,
    });
  })
);

// Separate DB insert logic
const createEvent = async (data: CreateEventBody) => {
  try {
    await connectToDB();
    const event = new Event(data);
    const saved = await event.save();
    return saved.toObject();
  } catch (err) {
    console.error('Event creation failed:', err);
    throw new Error('Event creation failed');
  }
};
