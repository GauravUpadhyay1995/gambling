import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/config/mongo";
import { asyncHandler } from "@/lib/asyncHandler";
import { fetchMarkets } from "@/lib/marketService";

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectToDB();

   const params = req.nextUrl.searchParams;
    const source = params.get('source')?.trim() || 'force-backend';
  const markets = await fetchMarkets(source);

  return NextResponse.json(
    {
      success: true,
      message: "Markets fetched successfully",
      data: markets,
    },
    { headers: { "Cache-Control": "no-store" } } // disable caching → always fresh
  );
});
