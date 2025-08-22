import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Event } from '@/models/Event';

export const GET =
  asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;

    const search = searchParams.get('search')?.trim() || '';
    const from = searchParams.get('from')?.trim() || '';

    const title = searchParams.get('title')?.trim() || '';
    const venue = searchParams.get('venue')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = (searchParams.get('perPage') || '10').toLowerCase();
    const customLimit = parseInt(searchParams.get('customLimit') || '', 10) || 0;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

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
    if (venue) match.venue = { $regex: venue, $options: 'i' };
    if (startDate) match.startDate = { $gte: startDate };
    if (endDate) match.endDate = { $lte: endDate };
    if (from === 'frontend') match.isActive = true;
    const pipeline: any[] = [];
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { venue: { $regex: search, $options: 'i' } },
          ],
        },
      });
    } else if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push(
      { $project: { __v: 0, createdBy: 0, updatedBy: 0, updatedAt: 0 } },
      { $sort: { startDate: -1 } }
    );

    if (!showAll) {
      pipeline.push({ $skip: skip }, { $limit: limit });
    }

    // Execute aggregations with error handling
    let events, totalCountArr;
    try {
      [events, totalCountArr] = await Promise.all([
        Event.aggregate(pipeline),
        Event.aggregate([
          ...pipeline.filter(stage => !('$skip' in stage || '$limit' in stage)),
          { $count: 'count' },
        ]),
      ]);
    } catch (error) {
      console.error('Aggregation failed:', error);
      return sendResponse(
        { success: false, message: 'Failed to fetch events', error: error.message },
        { status: 500 }
      );
    }

    const totalRecords = totalCountArr?.[0]?.count ?? 0; // Safe access with nullish coalescing

    return sendResponse({
      success: true,
      message: events.length ? 'Events fetched successfully' : 'No events found',
      data: { totalRecords, currentPage: page, perPage: showAll ? totalRecords : limit, events, limit },
    });
  })
