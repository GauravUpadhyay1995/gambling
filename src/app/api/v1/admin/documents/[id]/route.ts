
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { ImportantDocument } from '@/models/ImportantDocument';
// import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import mongoose from 'mongoose';
// import { User } from '@/models/User';

export const GET =   asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const documentId = params?.id;

    if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid document ID' },
        { status: 400 }
      );
    }

    const document = await ImportantDocument.findById(documentId)
      // .populate('createdBy updatedBy', 'name') // ✅ populates user names
      .select('-__v -updatedAt -createdAt')
      .lean()
      .exec();

    if (!document) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Document fetched successfully',
        data: document,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300',
        },
      }
    );
  })