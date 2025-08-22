import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { connectToDB } from '@/config/mongo';
import { Gallery } from '@/models/Gallery';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { updateGallerySchema } from '@/lib/validations/gallery.schema';
import { Types } from 'mongoose';
import {verifyAdmin}  from '@/lib/verifyAdmin';

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();
    const user = (req as any).user;
    const galleryId = params.id;

    if (!Types.ObjectId.isValid(galleryId)) {
      return NextResponse.json({ success: false, message: 'Invalid gallery ID' }, { status: 400 });
    }

    const existing = await Gallery.findById(galleryId);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gallery not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const rawBody: any = {};

    for (const [key, value] of formData.entries()) {
      if (key === 'video_url') {
        if (!rawBody.video_url) rawBody.video_url = [];
        rawBody.video_url = JSON.parse(value.toString());
        // rawBody.video_url.push({ url: value });
      } else {
        rawBody[key] = value;
      }
    }

    const imageFiles = formData.getAll('images') as File[];
    delete rawBody.images;

    const { error, value } = updateGallerySchema.validate(rawBody, { abortEarly: false });
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

    // Upload new images
    let newImageMeta: {
      url: string;
      mimetype: string;
      size: number;
    }[] = [];

    for (const file of imageFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadBufferToS3(buffer, file.type, file.name, 'gallery');
      if (uploaded?.url) {
        newImageMeta.push({
          url: uploaded.url,
          mimetype: file.type,
          size: file.size,
        });
      }
    }

    // Build update object
    const updateFields: any = {
      ...value,
      updatedBy: new Types.ObjectId(user.id),
    };

    // Avoid conflict by handling $push separately
    const pushFields: any = {};

    if (newImageMeta.length > 0) {
      pushFields.images = { $each: newImageMeta };
    }

    if (value.video_url?.length > 0) {
      updateFields.video_url = value.video_url; // ✅ overwrite instead of pushing
    }
    // Main update
    const updated = await Gallery.findByIdAndUpdate(
      galleryId,
      {
        $set: updateFields,
        ...(Object.keys(pushFields).length > 0 ? { $push: pushFields } : {}),
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Gallery updated successfully',
      data: updated?.toObject(),
    });
  })
);
