import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { connectToDB } from '@/config/mongo';
import { ImportantDocument } from '@/models/ImportantDocument';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { importantDocumentValidationSchema } from '@/lib/validations/document.schema';
import { Types } from 'mongoose';
import {verifyAdmin}  from '@/lib/verifyAdmin';
type CreateDocBody = {
  title: string;
  description: string;
  documents?: {
    url: string;
    mimetype: string;
    size: number;
    _id?: string;
  }[];
  publishDate: Date;
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
    if (rawBody.publishDate && typeof rawBody.publishDate === 'string') {
      rawBody.publishDate = new Date(rawBody.publishDate);
    }


    const imageFiles = formData.getAll('documents') as File[];
    delete rawBody.documents;

    // ✅ Validate input
    const { error, value } = importantDocumentValidationSchema.validate(rawBody, { abortEarly: false });
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
        const upload = await uploadBufferToS3(buffer, file.type, file.name, 'documents');
        console.log("upload", upload)
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
    } else {
      console.log("No File Found")
    }

    const docData: CreateDocBody = {
      ...value,
      documents: imageMetaData.length > 0 ? imageMetaData : undefined,
      createdBy: new Types.ObjectId(user.id),
      updatedBy: new Types.ObjectId(user.id),
    };

    const created = await createDoc(docData);

    return NextResponse.json({
      success: true,
      message: 'Document created successfully',
      data: created,
    });
  })
);

// Separate DB insert logic
const createDoc = async (data: CreateDocBody) => {
  try {
    await connectToDB();
    const doc = new ImportantDocument(data);
    const saved = await doc.save();
    return saved.toObject();
  } catch (err) {
    console.error('Document creation failed:', err);
    throw new Error('Event creation failed');
  }
};
