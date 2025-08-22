import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { ImportantDocument } from '@/models/ImportantDocument';

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectToDB();

  const searchParams = req.nextUrl.searchParams;
  const from = searchParams.get('from')?.trim() || '';
  const search = searchParams.get('search')?.trim() || '';
  const title = searchParams.get('title')?.trim() || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = (searchParams.get('perPage') || '10').toLowerCase();
  const customLimit = parseInt(searchParams.get('customLimit') || '', 10) || 0;
  const publishDate = searchParams.get('publishDate') ? new Date(searchParams.get('publishDate')!) : undefined;


  const showAll = perPage === 'all';
  const limit = customLimit || (showAll ? 0 : Math.min(parseInt(perPage, 10) || 10, 100));
  const skip = showAll ? 0 : (page - 1) * limit;

  if (page < 1 || limit < 0) {
    return sendResponse(
      { success: false, message: 'Invalid pagination parameters' },
      { status: 400 }
    );
  }

  const match: Record<string, any> = {};
  if (title) match.title = { $regex: title, $options: 'i' };
  if (publishDate) match.publishDate = { $gte: publishDate };
  if (from === 'frontend') match.isActive = true;

  const pipeline: any[] = [];
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: search, $options: 'i' } },
        ],
      },
    });
  } else if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  pipeline.push(
    { $project: { __v: 0, createdBy: 0, updatedBy: 0, updatedAt: 0 } },
    { $sort: { publishDate: -1 } }
  );

  if (!showAll) {
    pipeline.push({ $skip: skip }, { $limit: limit });
  }

  // Execute aggregations with error handling
  let docs, totalCountArr;
  try {
    [docs, totalCountArr] = await Promise.all([
      ImportantDocument.aggregate(pipeline),
      ImportantDocument.aggregate([
        ...pipeline.filter(stage => !('$skip' in stage || '$limit' in stage)),
        { $count: 'count' },
      ]),
    ]);
  } catch (error) {
    console.error('Aggregation failed:', error);
    return sendResponse(
      { success: false, message: 'Failed to fetch docs', error: error.message },
      { status: 500 }
    );
  }

  const totalRecords = totalCountArr?.[0]?.count ?? 0; // Safe access with nullish coalescing

  return sendResponse({
    success: true,
    message: docs.length ? 'docs fetched successfully' : 'No docs found',
    data: { totalRecords, currentPage: page, perPage: showAll ? totalRecords : limit, docs, limit },
  });
})