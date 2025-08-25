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

    let isExpired: "Closed" | "Opened" | "Upcomming";

    if (nowMinutes < startMinutes) {
      isExpired = "Upcomming";
    } else if (nowMinutes > endMinutes) {
      isExpired = "Closed";
    } else {
      isExpired = "Opened";
    }

    return {
      ...market,
      isExpired,
    };
  });
}
