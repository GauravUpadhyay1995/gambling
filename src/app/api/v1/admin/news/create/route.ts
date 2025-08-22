import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { connectToDB } from '@/config/mongo';
import { News } from '@/models/News';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { createNewsSchema } from '@/lib/validations/news.schema';
import {verifyAdmin}  from '@/lib/verifyAdmin';

type CreateNewsBody = {
  title: string;
  category: string;
  description: string;
  bannerImage: string;
  createdBy: string;
  updatedBy?: string;
};

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const user = (req as any).user;

    const formData = await req.formData();
    const file = formData.get('bannerImage') as File | null;

    const rawBody = Object.fromEntries(
      [...formData.entries()].filter(([key]) => key !== 'bannerImage')
    );

    const { error, value: validatedBody } = createNewsSchema.validate(rawBody, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details.reduce((acc, curr) => {
        acc[curr.path[0] as string] = curr.message;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
          data: null,
        },
        { status: 400 }
      );
    }

    // 🖼 Upload image if valid
    let bannerImageUrl = '';

    if (file && file.size > 0) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, message: 'Only image files are allowed' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadBufferToS3(buffer, file.type, file.name, 'news');
      bannerImageUrl = uploadResult?.url || '';
    }

    const newsData: CreateNewsBody = {
      ...validatedBody,
      bannerImage: bannerImageUrl,
      createdBy: user.id,
      updatedBy: user.id,
    };

    const createdNews = await createNews(newsData);

    return NextResponse.json({
      success: true,
      message: 'News created successfully',
      data: createdNews,
    });
  })
);

// 💡 DB Insert Helper (no need for connectToDB again)
const createNews = async (data: CreateNewsBody) => {
  const news = new News(data);
  const result = await news.save();
  return result.toObject();
};
