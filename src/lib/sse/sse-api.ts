import { SSEManager } from "./SSEManager";

// Extend globalThis to include __sseManager for type safety
declare global {
  var __sseManager: SSEManager | undefined;
}

// Get the singleton instance of SSEManager
function getSSEManager(): SSEManager {
  return global.__sseManager ?? (global.__sseManager = new SSEManager());
}

/**
 * Send an SSE event to a specific client by clientId.
 * @param clientId - The id of the client to send the event to
 * @param data - The stringified payload to send
 * @param event - Optional event name
 * @example
 *   sendSSEToClient('abc123', JSON.stringify({ foo: 'bar' }), 'custom-event');
 */
export function sendSSEToClient(
  clientId: string,
  data: string,
  event?: string,
) {
  getSSEManager().sendToClient(clientId, data, event);
}

/**
 * Broadcast an SSE event to all connected clients.
 * @param data - The stringified payload to send
 * @param event - Optional event name
 * @example
 *   broadcastSSE(JSON.stringify({ message: 'Hello all!' }), 'broadcast');
 */
export function broadcastSSE(data: string, event?: string) {
  getSSEManager().broadcast(data, event);
}
