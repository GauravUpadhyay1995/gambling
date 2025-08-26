// src/app/api/v1/admin/History/profile/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/config/mongo';
import { Betting } from '@/models/Betting';
import { asyncHandler } from '@/lib/asyncHandler';
import mongoose from 'mongoose';
import { Types } from "mongoose"; // if using mongoose


export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    await connectToDB();

    const customerId = params.id;

    //  Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return NextResponse.json(
            { success: false, message: 'Invalid History ID format' },
            { status: 400 }
        );
    }

    const pipeline = [
        // ✅ Filter by customerId first
        {
            $match: {
                customer_id: new Types.ObjectId(customerId), // ensure it's ObjectId
            },
        },

        // Join with Market collection
        {
            $lookup: {
                from: "markets",
                localField: "market_id",
                foreignField: "_id",
                as: "market",
            },
        },
        { $unwind: "$market" },

        // Join with Rating collection
        {
            $lookup: {
                from: "ratings",
                localField: "rating_id",
                foreignField: "_id",
                as: "rating",
            },
        },
        { $unwind: "$rating" },

        // Join with Customer collection
        {
            $lookup: {
                from: "customers",
                localField: "customer_id",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: "$customer" },

        // Project only required fields
        {
            $project: {
                _id: 1,
                status: "$customer_betting_result",
                choosen_number: "$choosen_number",
                opening_result: "$opening_result",
                amount: "$amount",
                createdAt: 1,
                market_name: "$market.marketName",
                rating_name: "$rating.ratingName",
                customer_name: "$customer.name",
            },
        },

        // Sort by latest
        { $sort: { createdAt: -1 } },
    ];

    // ✅ Run aggregation
    const results = await Betting.aggregate(pipeline);
    //  Use .lean() to improve read performance (returns plain JS object)
    // const bettingHistory = await Betting.find({ customer_id: customerId }).lean();

    if (!results) {
        return NextResponse.json(
            { success: false, message: 'History not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        message: 'History fetched successfully',
        data: results,
    });
})