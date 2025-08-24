import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Rating } from '@/models/Rating';
import { createRatingSchema } from '@/lib/validations/rating.schema';
import { Types } from 'mongoose';
import { verifyAdmin } from '@/lib/verifyAdmin';

type CreateRatingBody = {
  ratingName: string;
  convertValue: {
    a: string;
    b: string;

  };

  isActive?: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
};

export const POST = verifyAdmin(
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();
    const user = (req as any).user;

    // ✅ Parse JSON body
    const rawBody = await req.json();

   

    // ✅ Validate input with Joi schema
    const { error, value } = createRatingSchema.validate(rawBody, { abortEarly: false });
    if (error) {
      const formattedErrors = error.details.reduce((acc, curr) => {
        acc[curr.path[0] as string] = curr.message;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
          data: null,
        },
        { status: 400 }
      );
    }

    const ratingData: CreateRatingBody = {
      ...value,
      isActive: rawBody.isActive ?? true,
      createdBy: new Types.ObjectId(user.id),
      updatedBy: new Types.ObjectId(user.id),
    };

    // ✅ Insert into DB
    const createdRating = new Rating(ratingData);
    await createdRating.save();

    return NextResponse.json({
      success: true,
      message: 'Rating created successfully',
      data: createdRating,
    });
  })
);
