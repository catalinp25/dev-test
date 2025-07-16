import { NextRequest } from "next/server";
import { SSEManager } from "@/lib/sse/SSEManager";

// Extend globalThis to include __sseManager for type safety
declare global {
  var __sseManager: SSEManager | undefined;
}

// Singleton instance of SSEManager (in-memory for now)
const sseManager =
  global.__sseManager || (global.__sseManager = new SSEManager());

// Utility to generate a random client id
function generateClientId() {
  return Math.random().toString(36).substring(2, 15);
}

// Basic SSE endpoint handler for Next.js App Router
export async function GET(req: NextRequest) {
  // Create a unique id for this client
  const clientId = generateClientId();

  // Heartbeat interval in milliseconds
  const HEARTBEAT_INTERVAL = 20000; // 20 seconds

  // Variable to hold the heartbeat interval id
  let heartbeat: NodeJS.Timeout | undefined;
  // Track if the stream is already closed
  let closed = false;

  // Create a ReadableStream to send SSE data
  const stream = new ReadableStream({
    start(controller) {
      // Utility function to send an SSE event with error handling
      function sendEvent(data: string, event?: string) {
        try {
          let payload = "";
          if (event) payload += `event: ${event}\n`;
          payload += `data: ${data}\n\n`;
          controller.enqueue(new TextEncoder().encode(payload));
        } catch (err) {
          // Log error and close the stream if enqueue fails
          console.error(`Error sending event to client ${clientId}:`, err);
          cleanup();
        }
      }

      // Cleanup function to remove client, clear interval, and close stream
      function cleanup() {
        if (closed) return;
        closed = true;
        sseManager.removeClient(clientId);
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch (err) {
          // Ignore if already closed
        }
        console.log(`[SSE] Client disconnected: ${clientId}`);
      }

      // Register this client with the SSEManager
      sseManager.addClient({
        id: clientId,
        send: sendEvent,
        close: cleanup,
      });

      // Log client connection
      console.log(`[SSE] Client connected: ${clientId}`);

      // Send a test event when the client connects
      sendEvent(
        JSON.stringify({ message: "connected", clientId }),
        "connected",
      );

      // Start a heartbeat interval to keep the connection alive
      heartbeat = setInterval(() => {
        sendEvent(JSON.stringify({ ts: Date.now() }), "ping");
      }, HEARTBEAT_INTERVAL);
    },
    cancel() {
      // Cleanup everything when the client disconnects
      // (This is called automatically by the stream)
      sseManager.removeClient(clientId);
      if (heartbeat) clearInterval(heartbeat);
      closed = true;
      console.log(`[SSE] Client disconnected: ${clientId}`);
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
