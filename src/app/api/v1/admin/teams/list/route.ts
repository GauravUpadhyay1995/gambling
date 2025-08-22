import { NextRequest } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { withAuth } from '@/lib/withAuth';
import { asyncHandler } from '@/lib/asyncHandler';
import { sendResponse } from '@/lib/sendResponse';
import { Team } from '@/models/Team';

export const GET = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const searchParams = req.nextUrl.searchParams;

    const search = searchParams.get('search')?.trim();
    const name = searchParams.get('name')?.trim();
    const designation = searchParams.get('designation')?.trim();
    const department = searchParams.get('department')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = searchParams.get('perPage') || '10';
    const customLimit = parseInt(searchParams.get('customLimit') || '') || 0;
        const from = searchParams.get('from')?.trim() || '';

    const showAll = perPage === 'All';
    const limit = customLimit || (showAll ? 0 : parseInt(perPage) || 10);
    const skip = showAll ? 0 : (page - 1) * limit;

    // 📌 Build $match object
    const match: Record<string, any> = {};
    if (name) match.name = name;
    if (designation) match.designation = designation;
    if (department) match.department = department;
    if (from === 'frontend') match.isActive = true;

    // 📌 Build $search conditions
    const pipeline: any[] = [];

    if (search) {
      pipeline.push({
        $search: {
          index: 'default',
          compound: {
            should: [
              { text: { query: search, path: 'name' } },
              { text: { query: search, path: 'designation' } },
              { text: { query: search, path: 'department' } },
            ],
          },
        },
      });
    }

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

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

    if (!showAll) {
      pipeline.push({ $skip: skip }, { $limit: limit });
    }

    const [teams, totalCountArr] = await Promise.all([
      Team.aggregate(pipeline),
      Team.aggregate([
        ...pipeline.filter(stage => !('$skip' in stage || '$limit' in stage)),
        { $count: 'count' },
      ]),
    ]);

    const totalRecords = totalCountArr[0]?.count || 0;

    return sendResponse({
      success: true,
      message: teams.length ? 'Teams fetched successfully' : 'No teams found',
      data: {
        totalRecords,
        currentPage: page,
        perPage: showAll ? totalRecords : limit,
        teams,
        limit,
      },
    });
  })