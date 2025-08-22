import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Trl } from '@/models/Trl';

export const GET =  asyncHandler(async (req: NextRequest) => {
        await connectToDB();

        const params = req.nextUrl.searchParams;

        const filters = {
            search: params.get('search')?.trim() || '',
            title: params.get('title')?.trim(),
        };
        const from = params.get('from')?.trim() || '';

        const page = Math.max(1, parseInt(params.get('page') || '1'));
        const perPage = params.get('perPage') || '10';
        const customLimit = parseInt(params.get('customLimit') || '') || 0;

        const isShowAll = perPage === 'All';
        const limit = customLimit || (isShowAll ? 0 : parseInt(perPage) || 10);
        const skip = isShowAll ? 0 : (page - 1) * limit;

        const pipeline: any[] = [];

        //  Full-text search via Atlas Search (optional block, can be removed if not using Atlas)
        if (filters.search) {
            pipeline.push({
                $search: {
                    index: 'default',
                    compound: {
                        should: [
                            { text: { query: filters.search, path: 'title' } },
                        ],
                    },
                },
            });
        }

        //  Regex-based partial match on title
        const match: Record<string, any> = {};
        if (filters.title) {
            match.title = { $regex: filters.title, $options: 'i' }; // Case-insensitive partial match
        }
    if (from === 'frontend') match.isActive = true;

        if (Object.keys(match).length) {
            pipeline.push({ $match: match });
        }

        //  Projection & sorting
        pipeline.push(
            {
                $project: {
                    __v: 0,
                    createdBy: 0,
                    updatedBy: 0,
                },
            },
            { $sort: { updatedAt: -1 } }
        );

        //  Pagination
        if (!isShowAll) {
            pipeline.push({ $skip: skip }, { $limit: limit });
        }

        //  Parallel data and count aggregation
        const [trls, countArr] = await Promise.all([
            Trl.aggregate(pipeline),
            Trl.aggregate([
                ...pipeline.filter(stage => !('$skip' in stage || '$limit' in stage)),
                { $count: 'count' },
            ]),
        ]);

        const totalRecords = countArr[0]?.count || 0;

        return sendResponse({
            success: true,
            message: trls.length ? 'TRLs fetched successfully' : 'No TRLs found',
            data: {
                totalRecords,
                currentPage: page,
                perPage: isShowAll ? totalRecords : limit,
                trls,
                limit,
            },
        });
    })