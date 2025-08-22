import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { withAuth } from '@/lib/withAuth';
import {verifyAdmin}  from '@/lib/verifyAdmin';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { User } from '@/models/User';

export const GET = verifyAdmin(asyncHandler(async (req: NextRequest) => {
  await connectToDB();
  // console.log('>>>>>>>>...',req); 

  const searchParams = req.nextUrl.searchParams;
  const customer = searchParams.get('customer');
  const mobile = searchParams.get('mobile');
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = searchParams.get('perPage') || '10';

  const showAll = perPage == 'All';
  const limit = showAll ? 0 : parseInt(perPage);
  const skip = showAll ? 0 : (page - 1) * limit;

  const match: any = {};
  if (mobile) match.mobile = mobile;

  const searchConditions: any[] = [];
  if (customer) {
    searchConditions.push({ text: { query: customer, path: 'customer' } });
  }

  const pipeline: any[] = [];

  // 🔍 Full-text search if provided
  if (searchConditions.length > 0) {
    pipeline.push({
      $search: {
        index: 'default',
        compound: { must: searchConditions },
      },
    });
  }

  // 🧾 Apply mobile match if present
  if (Object.keys(match).length > 0) pipeline.push({ $match: match });

  // 👤 Join verified user name
  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'verified_by',
        foreignField: '_id',
        as: 'verified_user'
      }
    },
    {
      $addFields: {
        verified_by: { $arrayElemAt: ['$verified_user.name', 0] }
      }
    },
    {
      $project: {
        otp: 0,
        __v: 0,
        verified_user: 0,
        password: 0
      }
    },
    { $sort: { updatedAt: -1 } }
  );

  // ⏬ Pagination
  if (!showAll) {
    pipeline.push({ $skip: skip }, { $limit: limit });
  }

  const [customers, totalCountResult] = await Promise.all([
    User.aggregate(pipeline),
    User.aggregate([
      ...pipeline.filter(stage => !('$skip' in stage || '$limit' in stage)),
      { $count: 'count' }
    ])
  ]);

  const totalRecords = totalCountResult[0]?.count || 0;

  return sendResponse({
    success: true,
    message: customers.length ? 'Customers fetched successfully' : 'No customers found',
    data: {
      totalRecords,
      isAuthorized : true,
      currentPage: page,
      perPage: showAll ? totalRecords : limit,
      customers,    
    }
  });
}));
