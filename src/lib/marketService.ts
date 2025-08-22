import { Market } from "@/models/Market";

export async function fetchMarkets(source: string | undefined = 'frontend') {
    console.log("Fetching markets from fetchMarkets>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>:", source);

    if (source === undefined) {
        source = 'frontend'

    }
    if (source.trim() === 'frontend') {
        return await Market.find({ isActive: true })
            .lean()
            .select("-__v -updatedAt")
            .sort({ createdAt: -1 })
            .exec();
    } else {
        // Backend fetch: all markets
        return await Market.find()
            .lean()
            .select("-__v -updatedAt")
            .sort({ createdAt: -1 })
            .exec();
    }
}
