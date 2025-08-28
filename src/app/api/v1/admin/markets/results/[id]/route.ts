import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { Market } from "@/models/Market";
import { Betting } from "@/models/Betting";
import { Rating } from "@/models/Rating";
import { asyncHandler } from "@/lib/asyncHandler";
import { Types } from "mongoose";

// helper: sum of digits → single ank निकालने के लिए
const getAnk = (panna: string) => {
  const sum = panna.split("").reduce((a, b) => a + Number(b), 0);
  return sum % 10;
};

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

    // 2️⃣ Run background task (non-blocking)
    (async () => {
      try {
        const bettings = await Betting.find({ market_id: marketId }).lean();
        if (bettings.length === 0) return;

        // Fetch ratings in one go
        const ratingIds = [...new Set(bettings.map((b) => String(b.rating_id)))];
        const ratings = await Rating.find({ _id: { $in: ratingIds } }).lean();

        // ratingMap for O(1) lookup
        const ratingMap = new Map(ratings.map((r) => [String(r._id), r]));

        const { a: open_panna, b: jodi, c: close_panna } =
          updatedMarket.marketValue;
        const openAnk = getAnk(open_panna);
        const closeAnk = getAnk(close_panna);
        console.log("openAnk, closeAnk", openAnk, closeAnk);

        // Prepare bulk operations
        const bulkOps: any[] = [];

        for (const betting of bettings) {
          const ratingData = ratingMap.get(String(betting.rating_id));
          if (!ratingData) continue;

          let isWinner = false;

          switch (ratingData.type) {
            case "single":
              if (
                Number(betting.choosen_number) === openAnk ||
                Number(betting.choosen_number) === closeAnk
              )
                isWinner = true;
              break;

            case "jodi":
              if (betting.choosen_number === jodi) isWinner = true;
              break;

            case "single panna":
            case "double panna":
            case "triple panna":
              if (
                betting.choosen_number === open_panna ||
                betting.choosen_number === close_panna
              )
                isWinner = true;
              break;

            case "half sangam":
              if (
                betting.choosen_number === `${open_panna}-${closeAnk}` ||
                betting.choosen_number === `${close_panna}-${openAnk}`
              )
                isWinner = true;
              break;

            case "full sangam":
              if (betting.choosen_number === `${open_panna}-${close_panna}`)
                isWinner = true;
              break;
          }

          bulkOps.push({
            updateOne: {
              filter: { _id: betting._id },
              update: {
                $set: {
                  customer_betting_result: isWinner ? "win" : "loss",
                  opening_result: `${open_panna} ${jodi} ${close_panna}`,
                },
              },
            },
          });
        }

        if (bulkOps.length > 0) {
          await Betting.bulkWrite(bulkOps, { ordered: false });
        }

        console.log("✅ Background win/loss calculation finished");
      } catch (err) {
        console.error("❌ Error in background task:", err);
      }
    })();

    return response;
  }
);
