import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Payment } from '@/models/Payment';
import { Balance } from "@/models/Balance";
import { asyncHandler } from '@/lib/asyncHandler';
import { Types } from 'mongoose';

export const POST = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const customerId = params?.id;

    if (!Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Customer ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    body.customer_id = customerId;

    const createdPayment = new Payment(body);
    const result = await createdPayment.save();
    return NextResponse.json(
      {
        success: true,
        message: 'Payment Created successfully',
        data: result,
      },
      { headers: { 'Cache-Control': 'no-store' } } // prevent stale caching
    );
  }
);
export const PATCH = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const paymentId = params?.id;
    if (!Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid PAYMENT ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Update Payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .lean()
      .select('-__v');

    if (!updatedPayment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    const customerId = updatedPayment.customer_id;

    // ✅ Update or create Balance in one step using upsert
    const updatedBalance = await Balance.findOneAndUpdate(
      { customer_id: customerId },
      { $inc: { balance_amount: parseFloat(body.amount || updatedPayment.amount) }, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true } // create if not exists
    ).lean();

    return NextResponse.json(
      {
        success: true,
        message: 'Payment updated successfully',
        data: {
          payment: updatedPayment,
          balance: updatedBalance,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
);
export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await connectToDB();

  const customerId = params?.id;

  // Validate customerId
  if (!Types.ObjectId.isValid(customerId)) {
    return NextResponse.json({ success: false, message: 'Invalid Customer ID' }, { status: 400 });
  }

  // Aggregation pipeline to fetch payments with customer info
  const payments = await Payment.aggregate([
    { $match: { customer_id: new Types.ObjectId(customerId) } }, // filter by customer_id
    { $sort: { createdAt: -1 } }, // latest first
    {
      $lookup: {
        from: 'customers', // collection name in MongoDB
        localField: 'customer_id',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' }, // convert array to object
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

  return NextResponse.json({
    success: true,
    message: payments.length ? 'Payments fetched successfully' : 'No payments found',
    data: payments,
  });
});



