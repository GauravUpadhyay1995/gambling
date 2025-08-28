import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { Market } from "@/models/Market";
import { Betting } from "@/models/Betting";
import { Rating } from "@/models/Rating";
import { Balance } from "@/models/Balance";
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
    // if (!Types.ObjectId.isValid(marketId)) {
    //   return NextResponse.json(
    //     { success: false, message: "Invalid market ID" },
    //     { status: 400 }
    //   );
    // }

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

    const response = NextResponse.json(
      {
        success: true,
        message: "Market declared successfully",
        data: updatedMarket,
      },
      { headers: { "Cache-Control": "no-store" } }
    );

    // 2️⃣ Background task for betting results and balance updates
    (async () => {
      try {
        const bettings = await Betting.find({ market_id: marketId, customer_betting_result: "Pending" }).lean();
        if (!bettings.length) return;

        // Fetch ratings in one go
        const ratingIds = [...new Set(bettings.map(b => String(b.rating_id)))];
        const ratings = await Rating.find({ _id: { $in: ratingIds } }).lean();
        const ratingMap = new Map(ratings.map(r => [String(r._id), r]));

        const { a: open_panna, b: jodi, c: close_panna } = updatedMarket.marketValue;
        const openAnk = getAnk(open_panna);
        const closeAnk = getAnk(close_panna);
        console.log("Market Results:", { open_panna, jodi, close_panna, openAnk, closeAnk });

        // Prepare bulk operations
        const bulkBettingOps: any[] = [];
        const balanceMap: Map<string, number> = new Map(); // customerId => balance change

        for (const betting of bettings) {
          const ratingData = ratingMap.get(String(betting.rating_id));
          if (!ratingData) continue;

          let isWinner = false;

          switch (ratingData.type) {
            case "single":
              if (Number(betting.choosen_number) === openAnk || Number(betting.choosen_number) === closeAnk) isWinner = true;
              break;

            case "jodi":
              if (betting.choosen_number === jodi) isWinner = true;
              break;

            case "single panna":
            case "double panna":
            case "triple panna":
              if (betting.choosen_number === open_panna || betting.choosen_number === close_panna) isWinner = true;
              break;

            case "half sangam":
              if (betting.choosen_number === `${open_panna}-${closeAnk}` || betting.choosen_number === `${close_panna}-${openAnk}`) isWinner = true;
              break;

            case "full sangam":
              if (betting.choosen_number === `${open_panna}-${close_panna}`) isWinner = true;
              break;
          }

          const result = isWinner ? "win" : "loss";
          bulkBettingOps.push({
            updateOne: {
              filter: { _id: betting._id },
              update: {
                $set: {
                  customer_betting_result: result,
                  opening_result: `${open_panna} ${jodi} ${close_panna}`
                }
              }
            }
          });

          // Update balance map
          let winningAmount = 0;
          if (isWinner && ratingData.convertValue) {
            const { a, b } = ratingData.convertValue;
            winningAmount = Math.floor((betting.amount / Number(a)) * Number(b));
            console.log("Winning Amount:", winningAmount);
          }else{
            console.log("No winning amount");
          }

          const changeAmount = isWinner ? winningAmount : -(betting.amount || 0);

          balanceMap.set(betting.customer_id.toString(), (balanceMap.get(betting.customer_id.toString()) || 0) + changeAmount);
        }

        // Execute bulk betting update
        if (bulkBettingOps.length > 0) {
          await Betting.bulkWrite(bulkBettingOps, { ordered: false });
        }

        // Update balances
        for (const [customerId, amountChange] of balanceMap.entries()) {
          await Balance.findOneAndUpdate(
            { customer_id: customerId },
            { $inc: { balance_amount: amountChange }, $setOnInsert: { customer_id: customerId } },
            { upsert: true, new: true }
          );
        }

        console.log("✅ Background win/loss and balance update finished");

      } catch (err) {
        console.error("❌ Error in background task:", err);
      }
    })();

    return response;
  }
);
