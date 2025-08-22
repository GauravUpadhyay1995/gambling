import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Market } from '@/models/Market';
import { createMarketSchema } from '@/lib/validations/market.schema';
import { Types } from 'mongoose';
import { verifyAdmin } from '@/lib/verifyAdmin';

type CreateMarketBody = {
  marketName: string;
  marketValue: {
    a: string;
    b: string;
    c: string;
  };
  startDate: Date;
  endDate: Date;
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

    // ✅ Convert date strings to Date objects
    if (rawBody.startDate && typeof rawBody.startDate === 'string') {
      rawBody.startDate = new Date(rawBody.startDate);
    }
    if (rawBody.endDate && typeof rawBody.endDate === 'string') {
      rawBody.endDate = new Date(rawBody.endDate);
    }

    // ✅ Validate input with Joi schema
    const { error, value } = createMarketSchema.validate(rawBody, { abortEarly: false });
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

    const marketData: CreateMarketBody = {
      ...value,
      isActive: rawBody.isActive ?? true,
      createdBy: new Types.ObjectId(user.id),
      updatedBy: new Types.ObjectId(user.id),
    };

    // ✅ Insert into DB
    const createdMarket = new Market(marketData);
    await createdMarket.save();

    return NextResponse.json({
      success: true,
      message: 'Market created successfully',
      data: createdMarket,
    });
  })
);
