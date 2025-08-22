import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { connectToDB } from '@/config/mongo';
import { Trl } from '@/models/Trl';
import { uploadBufferToS3 } from '@/lib/uploadToS3';
import { updateTrlSchema } from '@/lib/validations/updateTrl.schema';
import {verifyAdmin}  from '@/lib/verifyAdmin';

export const PATCH = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();
    const user = (req as any).user;
    const trlId = params.id;

    const formData = await req.formData();
    const file = formData.get('banner') as File | null;

    const rawBody = Object.fromEntries([...formData.entries()].filter(([key]) => key !== 'banner'));

    // 🧪 Joi validation
    const { error, value } = updateTrlSchema.validate(rawBody, { abortEarly: false });

    if (error) {
      const errors = Object.fromEntries(error.details.map(d => [d.path[0], d.message]));
      return NextResponse.json({ success: false, message: 'Validation failed', errors }, { status: 400 });
    }

    // 📤 Upload banner image (if provided)
    let bannerUrl = '';
    if (file && file.size > 0) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ success: false, message: 'Only image files allowed for banner' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const upload = await uploadBufferToS3(buffer, file.type, file.name, 'trl');
      bannerUrl = upload?.url || '';
    }

    // 🧱 Construct update object
    const updateFields = {
      ...value,
      ...(bannerUrl && { banner: bannerUrl }),
      updatedBy: user.id,
    };

    if (Object.keys(updateFields).length <= 1) {
      return NextResponse.json({
        success: false,
        message: 'No valid fields provided for update',
      }, { status: 400 });
    }

    const updatedTrl = await Trl.findByIdAndUpdate(trlId, { $set: updateFields }, { new: true });

    if (!updatedTrl) {
      return NextResponse.json({ success: false, message: 'TRL not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'TRL updated successfully',
      data: updatedTrl.toObject(),
    });
  })
);
