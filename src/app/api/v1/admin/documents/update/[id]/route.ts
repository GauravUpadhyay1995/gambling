import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { connectToDB } from '@/config/mongo';
import { ImportantDocument } from '@/models/ImportantDocument';
import { User } from '@/models/User';

import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { updateImportantDocSchema } from '@/lib/validations/document.schema';
import mongoose, { Types } from 'mongoose';
import {verifyAdmin}  from '@/lib/verifyAdmin';

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const user = (req as any).user;
    const documentId = params.id;

   

    const existingDoc = await ImportantDocument.findById(documentId);
    if (!existingDoc) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const rawBody: any = {};
    for (const [key, value] of formData.entries()) {
      rawBody[key] = value;
    }

    if (rawBody.publishDate) {
      rawBody.publishDate = new Date(rawBody.publishDate);
    }

    const fileList = formData.getAll('documents') as File[];
    delete rawBody.documents;

    // ✅ Joi validation
    const { error, value } = updateImportantDocSchema.validate(rawBody, { abortEarly: false });
    if (error) {
      const formatted = error.details.reduce((acc, curr) => {
        acc[curr.path[0] as string] = curr.message;
        return acc;
      }, {} as Record<string, string>);
      return NextResponse.json({ success: false, message: 'Validation failed', errors: formatted }, { status: 400 });
    }

    // ✅ Upload any new documents
    let newDocs: {
      url: string;
      mimetype: string;
      size: number;
    }[] = [];

    if (fileList.length > 0) {
      for (const file of fileList) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadBufferToS3(buffer, file.type, file.name, 'documents');

        if (uploaded?.url) {
          newDocs.push({
            url: uploaded.url,
            mimetype: file.type,
            size: file.size,
          });
        }
      }
    }

    // ✅ Merge fields
    value.updatedBy = new Types.ObjectId(user.id);
    value.documents = [...(existingDoc.documents || []), ...newDocs];

    const updatedDoc = await ImportantDocument.findByIdAndUpdate(documentId, value, {
      new: true,
    })
      // .populate('createdBy updatedBy', 'name') // ✅ populate names
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDoc,
    });
  })
);
