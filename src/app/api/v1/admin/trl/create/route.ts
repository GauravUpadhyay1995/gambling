import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { connectToDB } from '@/config/mongo';
import { Trl } from '@/models/Trl';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { createTrlSchema } from '@/lib/validations/trl.schema';
import {verifyAdmin}  from '@/lib/verifyAdmin';

type CreateTrlBody = {
  title: string;
  duration: string;
  description: string;
  amount: string;
  requirement: string;
  banner: string;
  tag?: string;
  createdBy: string;
  updatedBy: string;
};

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const user = (req as any).user;

    const formData = await req.formData();
    const file = formData.get('banner') as File | null;

    // 🧹 Extract raw body (excluding file)
    const rawBody = Object.fromEntries([...formData.entries()].filter(([key]) => key !== 'banner'));

    // ✅ Joi validation
    const { error, value: validatedBody } = createTrlSchema.validate(rawBody, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.reduce((acc, curr) => {
        acc[curr.path[0] as string] = curr.message;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: errorMessages },
        { status: 400 }
      );
    }

    // 🖼️ Upload image if valid
    let bannerImageUrl = '';

    if (file && file.size > 0) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, message: 'Only image files are allowed for banner' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadBufferToS3(buffer, file.type, file.name, 'trl');
      bannerImageUrl = uploadResult?.url || '';
    }

    // 🔧 Construct TRL data
    const trlData: CreateTrlBody = {
      ...validatedBody,
      banner: bannerImageUrl,
      createdBy: user.id,
      updatedBy: user.id,
    };

    const createdTrl = await createTrl(trlData);

    return NextResponse.json({
      success: true,
      message: 'TRL created successfully',
      data: createdTrl,
    });
  })
);

// 💾 DB helper
const createTrl = async (data: CreateTrlBody) => {
  const trl = new Trl(data);
  const result = await trl.save();
  return result.toObject();
};
