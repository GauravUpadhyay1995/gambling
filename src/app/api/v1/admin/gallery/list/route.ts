import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Gallery } from '@/models/Gallery';

export const GET =  asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search')?.trim() || '';
        const from = searchParams.get('from')?.trim() || '';

    const title = searchParams.get('title')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = (searchParams.get('perPage') || '10').toLowerCase();
    const customLimit = parseInt(searchParams.get('customLimit') || '', 10) || 0;

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
    if (title) {
      match.title = { $regex: title, $options: 'i' };
    }
    if (from === 'frontend') match.isActive = true;

    const pipeline: any[] = [];

    // Full-text search
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { 'images.filename': { $regex: search, $options: 'i' } },
            { 'video_url.url': { $regex: search, $options: 'i' } },
          ],
        },
      });
    } else if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    // Lookup createdBy user
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdByUser',
        },
      },
      {
        $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true },
      },

      // Lookup updatedBy user
      {
        $lookup: {
          from: 'users',
          localField: 'updatedBy',
          foreignField: '_id',
          as: 'updatedByUser',
        },
      },
      {
        $unwind: { path: '$updatedByUser', preserveNullAndEmptyArrays: true },
      },

      // Project fields
      {
        $project: {
          __v: 0,
          updatedAt: 0,
          'createdByUser._id': 0,
          'createdByUser.email': 0,
          'createdByUser.password': 0,
          'updatedByUser._id': 0,
          'updatedByUser.email': 0,
          'updatedByUser.password': 0,
          
        },
      },

      // Sort by most recent
      { $sort: { createdAt: -1 } }
    );

    if (!showAll) {
      pipeline.push({ $skip: skip }, { $limit: limit });
    }

    // Execute both result and total count
    let galleries = [];
    let totalCountArr = [];

    try {
      [galleries, totalCountArr] = await Promise.all([
        Gallery.aggregate(pipeline),
        Gallery.aggregate([
          ...pipeline.filter(stage => !('$skip' in stage || '$limit' in stage)),
          { $count: 'count' },
        ]),
      ]);
    } catch (err: any) {
      return sendResponse(
        { success: false, message: 'Failed to fetch galleries', error: err.message },
        { status: 500 }
      );
    }

    const totalRecords = totalCountArr?.[0]?.count || 0;

    return sendResponse({
      success: true,
      message: galleries.length ? 'Galleries fetched successfully' : 'No galleries found',
      data: {
        totalRecords,
        currentPage: page,
        perPage: showAll ? totalRecords : limit,
        galleries,
        limit,
      },
    });
  })