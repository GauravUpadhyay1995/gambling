import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Customer } from '@/models/Customer';
import { Balance } from "@/models/Balance";

export const GET = verifyAdmin(asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get('name');
    const mobile = searchParams.get('mobile');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = searchParams.get('perPage') || '10';

    const showAll = perPage == 'All';
    const limit = showAll ? 0 : parseInt(perPage);
    const skip = showAll ? 0 : (page - 1) * limit;

    const match: any = {};
    if (mobile) match.mobile = mobile;

    const searchConditions: any[] = [];
    if (name) {
        searchConditions.push({ text: { query: name, path: 'name' } });
    }

    // Main pipeline for fetching customers
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
    pipeline.push({
        $lookup: {
            from: "balances",          // collection name in MongoDB (usually lowercase + plural)
            localField: "_id",         // field in Customer
            foreignField: "customer_id", // field in Balance
            as: "balanceInfo"
        }
    });
    // Sort by createdDate descending (newest first)
    pipeline.push({ $sort: { createdAt: -1 } });

    // Pipeline for counting total records (without pagination stages)
    const countPipeline = [...pipeline];

    // ⏬ Pagination for main pipeline
    if (!showAll) {
        pipeline.push({ $skip: skip }, { $limit: limit });
    }

    // Remove password field
    pipeline.push({
        $project: { password: 0 }
    });

    const [customers, totalCountResult] = await Promise.all([
        Customer.aggregate(pipeline),
        Customer.aggregate([...countPipeline, { $count: 'count' }])
    ]);

    const totalRecords = totalCountResult[0]?.count || 0;

    return sendResponse({
        success: true,
        message: customers.length ? 'Customers fetched successfully' : 'No customers found',
        data: {
            totalRecords,
            isAuthorized: true,
            currentPage: page,
            perPage: showAll ? totalRecords : limit,
            customers,
        }
    });
}));