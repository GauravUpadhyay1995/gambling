import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { Betting } from "@/models/Betting";
import { Market } from "@/models/Market";
import { bettingValidation } from "@/lib/validations/betting.schema";

// ✅ Define the shape of validated betting data
export interface IBettingInput {
    customer_id: string;
    market_id: string;
    rating_id: string;
    choosen_number?: string;
    opening_result?: string;
}

export const POST = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    // ✅ Parse JSON body
    const rawBody: any = await req.json();

    // ✅ Validate input with Joi schema
    const { error, value } = bettingValidation.validate(rawBody, { abortEarly: false });

    if (error) {
        const formattedErrors: Record<string, string> = error.details.reduce(
            (acc: any, curr) => {
                acc[curr.path[0] as string] = curr.message;
                return acc;
            },
            {}
        );

        return NextResponse.json(
            {
                success: false,
                message: "Validation failed",
                errors: formattedErrors,
                data: null,
            },
            { status: 400 }
        );
    }

    // ✅ Fetch market
    const market = await Market.findById(value.market_id);
    if (!market) {
        return NextResponse.json(
            { success: false, message: "Market not found", data: null },
            { status: 404 }
        );
    }

    // ✅ Extract current time in minutes
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // ✅ Extract market start & end times in minutes
    const startDate = new Date(market.startDate);
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();

    const endDate = new Date(market.endDate);
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

    // ✅ Check if market has not opened yet
    if (currentMinutes < startMinutes) {
        return NextResponse.json(
            {
                success: false,
                message: "Market not opened yet, please wait",
                data: null,
            },
            { status: 403 }
        );
    }

    // ✅ Check if market is already closed
    if (currentMinutes > endMinutes) {
        return NextResponse.json(
            {
                success: false,
                message: "Market has been closed",
                data: null,
            },
            { status: 403 }
        );
    }

    // ✅ Proceed with creation if market is active
    const bettingData: IBettingInput = value as IBettingInput;
    bettingData.opening_result = value.opening_result || "0"; // Default if not provided  
    const createdBetting = await Betting.create(bettingData);

    return NextResponse.json(
        {
            success: true,
            message: "Betting registered successfully",
            data: createdBetting,
        },
        { status: 201 }
    );
});
