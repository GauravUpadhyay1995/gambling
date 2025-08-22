import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Gallery } from '@/models/Gallery';
import { uploadBufferToS3, deleteFromS3 } from '@/lib/uploadToS3';
import { Types } from 'mongoose';
import {verifyAdmin}  from '@/lib/verifyAdmin';

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string, imageId: string } }) => {
    await connectToDB();
    const { id: galleryId, imageId } = params;

    if (!Types.ObjectId.isValid(galleryId) || !Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ success: false, message: 'Invalid IDs' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Image file is required' }, { status: 400 });
    }

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return NextResponse.json({ success: false, message: 'Gallery not found' }, { status: 404 });
    }
    const imageIndex = gallery.images.findIndex((img: any) => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return NextResponse.json({ success: false, message: 'Image not found in gallery' }, { status: 404 });
    }

    // Upload new image
    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await uploadBufferToS3(buffer, file.type, file.name, 'gallery');

    if (!upload?.url) {
      return NextResponse.json({ success: false, message: 'Image upload failed' }, { status: 500 });
    }

    // Delete old image from S3
    await deleteFromS3(gallery.images[imageIndex].url, 'gallery');

    // Replace with new image data
    gallery.images[imageIndex] = {
      url: upload.url,
      mimetype: file.type,
      size: file.size,
    };

    gallery.updatedBy = (req as any).user.id;

    await gallery.save();

    return NextResponse.json({
      success: true,
      message: 'Image updated successfully',
      data: gallery.toObject(),
    });
  })
);

export const DELETE = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string, imageId: string } }) => {
    await connectToDB();
    const { id:galleryId, imageId } = params;

    if (!Types.ObjectId.isValid(galleryId) || !Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ success: false, message: 'Invalid IDs' }, { status: 400 });
    }

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return NextResponse.json({ success: false, message: 'Gallery not found' }, { status: 404 });
    }

    const imageIndex = gallery.images.findIndex((img: any) => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return NextResponse.json({ success: false, message: 'Image not found in gallery' }, { status: 404 });
    }

    const imageToRemove = gallery.images[imageIndex];

    // Remove from array
    gallery.images.splice(imageIndex, 1);

    await deleteFromS3(imageToRemove.url,'gallery'); // ✅ Remove from S3
    await gallery.save();

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      data: gallery.toObject(),
    });
  })
);
