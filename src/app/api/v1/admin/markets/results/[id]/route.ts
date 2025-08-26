import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { Market } from "@/models/Market";
import { Betting } from "@/models/Betting";
import { Rating } from "@/models/Rating";
import { asyncHandler } from "@/lib/asyncHandler";
import { Types } from "mongoose";

export const PATCH = asyncHandler(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
        await connectToDB();

        const marketId = params?.id;

        if (!Types.ObjectId.isValid(marketId)) {
            return NextResponse.json(
                { success: false, message: "Invalid market ID" },
                { status: 400 }
            );
        }

        // 1️⃣ Update market immediately
        const updatedMarket = await Market.findByIdAndUpdate(
            marketId,
            { isDeclared: true, updatedAt: new Date() },
            { new: true, runValidators: true, select: "-__v" }
        ).lean();

        if (!updatedMarket) {
            return NextResponse.json(
                { success: false, message: "Market not found" },
                { status: 404 }
            );
        }

        // ✅ Send response quickly
        const response = NextResponse.json(
            {
                success: true,
                message: "Market declared successfully",
                data: updatedMarket,
            },
            { headers: { "Cache-Control": "no-store" } }
        );

        // 2️⃣ Run background task (don’t await)
        // (async () => {
        //     try {
        //         // Fetch all bettings for this market
        //         const bettings = await Betting.find({ market_id: marketId }).lean();

        //         if (bettings.length === 0) return;

        //         // Fetch all related ratings in ONE query
        //         const ratingIds = [...new Set(bettings.map(b => String(b.rating_id)))];
        //         const ratings = await Rating.find({ _id: { $in: ratingIds } }).lean();

        //         const ratingMap = new Map(
        //             ratings.map(r => [String(r._id), r])
        //         );

        //         // Process bettings
        //         for (const betting of bettings) {
        //             const ratingData = ratingMap.get(String(betting.rating_id));
        //             console.log("Processing betting:", betting._id, "with rating:", ratingData?._id);
        //             // const isWinner = betting.choosen_number === ratingData?.winningNumber;

        //             // await Betting.updateOne(
        //             //     { _id: betting._id },
        //             //     { $set: { status: isWinner ? "win" : "loss" } }
        //             // );
        //         }

        //         console.log("✅ Background win/loss calculation finished");
        //     } catch (err) {
        //         console.error("❌ Error in background task:", err);
        //     }
        // })();

        return response;
    }
);
