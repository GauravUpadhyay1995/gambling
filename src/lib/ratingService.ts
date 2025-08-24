import { Rating } from "@/models/Rating";

export async function fetchRatings(source: string | undefined = 'frontend') {
    console.log("Fetching markets from fetchMarkets>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>:", source);

    if (source === undefined) {
        source = 'frontend'

    }
    if (source.trim() === 'frontend') {
        return await Rating.find({ isActive: true })
            .lean()
            .select("-__v -updatedAt")
            .sort({ createdAt: -1 })
            .exec();
    } else {
        // Backend fetch: all markets
        return await Rating.find()
            .lean()
            .select("-__v -updatedAt")
            .sort({ createdAt: -1 })
            .exec();
    }
}
