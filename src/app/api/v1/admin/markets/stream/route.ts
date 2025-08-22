import { NextRequest } from "next/server";
import { connectToDB } from "@/config/mongo";
import { Market } from "@/models/Market";
import { fetchMarkets } from "@/lib/marketService";

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
      const markets = await fetchMarkets(source);
      send({ success: true, data: markets });

      // Watch MongoDB for live changes
      const changeStream = Market.watch([], { fullDocument: "updateLookup" });

      changeStream.on("change", async () => {
        const latest = await fetchMarkets();
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
