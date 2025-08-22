import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { ImportantDocument } from '@/models/ImportantDocument';
import { uploadBufferToS3, deleteFromS3 } from '@/lib/uploadToS3';
import { Types } from 'mongoose';
import {verifyAdmin}  from '@/lib/verifyAdmin';

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string, imageId: string } }) => {
    await connectToDB();
    const { id: docId, imageId } = params;
    console.log("docId, imageId", docId, imageId)

    if (!Types.ObjectId.isValid(docId) || !Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ success: false, message: 'Invalid IDs' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('documents') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'documents file is required' }, { status: 400 });
    }

    const DOC = await ImportantDocument.findById(docId);
    if (!DOC) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const imageIndex = DOC.documents.findIndex((img: any) => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return NextResponse.json({ success: false, message: 'document file not found in DATABSE' }, { status: 404 });
    }

    // Upload new image
    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await uploadBufferToS3(buffer, file.type, file.name, 'documents');

    if (!upload?.url) {
      return NextResponse.json({ success: false, message: 'Image upload failed' }, { status: 500 });
    }

    // Delete old image from S3
    await deleteFromS3(DOC.documents[imageIndex].url, 'documents');

    // Replace with new image data
    DOC.documents[imageIndex] = {
      url: upload.url,
      mimetype: file.type,
      size: file.size,
    };

    DOC.updatedBy = (req as any).user.id;

    await DOC.save();

    return NextResponse.json({
      success: true,
      message: 'Documents file updated successfully',
      data: DOC.toObject(),
    });
  })
);

export const DELETE = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string, imageId: string } }) => {
    await connectToDB();
    const { id: docId, imageId } = params;

    if (!Types.ObjectId.isValid(docId) || !Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ success: false, message: 'Invalid IDs' }, { status: 400 });
    }

    const DOC = await ImportantDocument.findById(docId);
    if (!DOC) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const imageIndex = DOC.documents.findIndex((img: any) => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return NextResponse.json({ success: false, message: 'Document not found ' }, { status: 404 });
    }

    const imageToRemove = DOC.documents[imageIndex];

    // Remove from array
    DOC.documents.splice(imageIndex, 1);

    await deleteFromS3(imageToRemove.url, 'documents'); // ✅ Remove from S3
    await DOC.save();

    return NextResponse.json({
      success: true,
      message: 'document file deleted successfully',
      data: DOC.toObject(),
    });
  })
);
