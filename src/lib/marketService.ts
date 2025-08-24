import { Market } from "@/models/Market";

export async function fetchMarkets(source: string | undefined = "frontend") {
  console.log("Fetching markets from fetchMarkets>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>:", source);

  if (!source) source = "frontend";

  const query = source.trim() === "frontend" ? { isActive: true } : {};
  const markets = await Market.find(query)
    .lean()
    .select("-__v -updatedAt")
    .sort({ createdAt: -1 })
    .exec();

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Add isExpired field dynamically
  return markets.map((market: any) => {
    const start = new Date(market.startDate);
    const end = new Date(market.endDate);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    let isExpired: "true" | "false" | "pending";

    if (nowMinutes < startMinutes) {
      isExpired = "pending";
    } else if (nowMinutes > endMinutes) {
      isExpired = "true";
    } else {
      isExpired = "false";
    }

    return {
      ...market,
      isExpired,
    };
  });
}
