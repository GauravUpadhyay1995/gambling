import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { Betting } from "@/models/Betting";

export const GET = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    // ✅ Extract pagination params from query string
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // ✅ Aggregation with lookups
    const pipeline = [
        // Join with Market
        {
            $lookup: {
                from: "markets",
                localField: "market_id",
                foreignField: "_id",
                as: "market",
            },
        },
        { $unwind: "$market" },

        // Join with Rating
        {
            $lookup: {
                from: "ratings",
                localField: "rating_id",
                foreignField: "_id",
                as: "rating",
            },
        },
        { $unwind: "$rating" },

        // Join with Customer
        {
            $lookup: {
                from: "customers",
                localField: "customer_id",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: "$customer" },

        // Project only what you need
        {
            $project: {
                _id: 1,
                createdAt: 1,
                status: "$customer_betting_result",
                choosen_number: "$choosen_number",
                opening_result: "$opening_result",
                market_name: "$market.marketName",   // 👈 make sure your Market schema field is correct
                rating_name: "$rating.ratingName",   // 👈 make sure your Rating schema field is correct
                customer_name: "$customer.name",      // 👈 check Customer schema field
            },
        },

        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
    ];


    // ✅ Run aggregation
    const results = await Betting.aggregate(pipeline);

    // ✅ Get total count for pagination
    const total = await Betting.countDocuments();

    return NextResponse.json({
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: results,
    });
});
