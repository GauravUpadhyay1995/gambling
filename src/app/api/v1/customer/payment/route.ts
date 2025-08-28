import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Payment } from '@/models/Payment';
import { asyncHandler } from '@/lib/asyncHandler';

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectToDB();

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  // Aggregation pipeline to join Payment with Customer
  const payments = await Payment.aggregate([
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'customers', // MongoDB collection name
        localField: 'customer_id',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' }, // Convert array to object
    {
      $project: {
        amount: 1,
        transactionId: 1,
        isApproved: 1,
        createdAt: 1,
        updatedAt: 1,
        'customer.name': 1,
        'customer.mobile': 1,
      },
    },
  ]);

  // Total records (without pagination)
  const total = await Payment.countDocuments();
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    success: true,
    message: payments.length ? 'Payments fetched successfully' : 'No payments found',
    page: page,
    limit: limit,
    total: total,
    totalPages: totalPages,
    data: payments,
  });
});