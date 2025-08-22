import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { News } from '@/models/News';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import {verifyAdmin}  from '@/lib/verifyAdmin';
// import { ApiError } from '@/lib/errorHandler';
// import { withAuth } from '@/lib/withAuth';

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();
    const user = (req as any).user;
    const newsId = params.id;

    const formData = await req.formData();
    const file = formData.get('bannerImage') as File | null;

    const rawBody = Object.fromEntries(
      [...formData.entries()].filter(([key]) => key !== 'bannerImage')
    );

    const existingNews = await News.findById(newsId);
    if (!existingNews) {
      return NextResponse.json(
        {
          success: false,
          message: 'News not found',
        },
        { status: 404 }
      );
    }

    // 📤 Upload new image if provided
    let bannerImageUrl = existingNews.bannerImage;
    if (file && file.size > 0 && file.type.startsWith('image/')) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadBufferToS3(buffer, file.type, file.name, 'news');
      bannerImageUrl = uploadResult?.url || bannerImageUrl;
    }

    const updateData: Partial<{
      title: string;
      category: string;
      description: string;
      bannerImage: string;
      updatedBy: string;
      isActive: boolean;
    }> = {
      updatedBy: user.id,
    };

    // ✅ Only include defined fields
    if (rawBody.title) updateData.title = rawBody.title as string;
    if (rawBody.category) updateData.category = rawBody.category as string;
    if (rawBody.description) updateData.description = rawBody.description as string;
    if (bannerImageUrl) updateData.bannerImage = bannerImageUrl;

    // ✅ Add isActive if it exists
    if (rawBody.isActive !== undefined) {
      const value = rawBody.isActive.toString().toLowerCase();
      if (value === 'true' || value === 'false') {
        updateData.isActive = value === 'true';
      }
    }
    
    const updated = await News.findByIdAndUpdate(
      newsId,
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: 'Update failed or News not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'News updated successfully',
      data: updated,
    });
  })
);
