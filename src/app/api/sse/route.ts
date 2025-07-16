import { NextRequest } from "next/server";

// Basic SSE endpoint handler for Next.js App Router
export async function GET(req: NextRequest) {
  // Create a ReadableStream to send SSE data
  const stream = new ReadableStream({
    start(controller) {
      // Utility function to send an SSE event
      function sendEvent(data: string, event?: string) {
        let payload = "";
        if (event) payload += `event: ${event}\n`;
        payload += `data: ${data}\n\n`;
        controller.enqueue(new TextEncoder().encode(payload));
      }

      // Send a test event when the client connects
      sendEvent(JSON.stringify({ message: "connected" }), "connected");

      // The stream will remain open until the client disconnects
    },
    cancel() {
      // Cleanup logic can be added here if needed when the client disconnects
    },
  });

  // Return the response with proper SSE headers
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Allow CORS from any origin (adjust as needed)
      "Access-Control-Allow-Origin": "*",
    },
  });
}
