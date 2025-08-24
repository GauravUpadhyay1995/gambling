import { NextRequest } from "next/server";
import { connectToDB } from "@/config/mongo";
import { Rating } from "@/models/Rating";
import { fetchRatings } from "@/lib/ratingService";

export async function GET(req: NextRequest) {
  await connectToDB();
  const params = req.nextUrl.searchParams;
  const source = params.get('source')?.trim() || 'force-backend-stream';
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Initial push
      const ratings = await fetchRatings(source);
      send({ success: true, data: ratings });

      // Watch MongoDB for live changes
      const changeStream = Rating.watch([], { fullDocument: "updateLookup" });

      changeStream.on("change", async () => {
        const latest = await fetchRatings(source);
        send({ success: true, data: latest });
      });

      req.signal.addEventListener("abort", () => {
        changeStream.close();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
