# Server-Sent Events (SSE) Integration Guide

This document explains how to use the reusable SSE layer in this project, including the `SSEManager`, utility functions, and integration patterns for backend modules.

---

## Overview

- **SSEManager**: Centralized in-memory manager for all active SSE client connections.
- **sse-api.ts**: Utility functions to send events to specific clients or broadcast to all clients.
- **SSE endpoint**: `/api/sse` for clients to connect and receive real-time events.
- **Frontend**: Use the EventSource API to subscribe and handle events.

---

## 1. How SSE Works in This Project

- Clients connect to `/api/sse` and keep the connection open.
- The server tracks each client connection in memory (via `SSEManager`).
- Backend modules can push events to clients using utility functions, without handling SSE protocol details.
- Heartbeat/ping events are sent automatically to keep connections alive.

---

## 2. Usage in Backend Modules

### Import Utility Functions

```ts
import { sendSSEToClient, broadcastSSE } from "@/lib/sse/sse-api";
```

### Send Event to a Specific Client

```ts
// clientId: The id received by the client on connect (see frontend section)
sendSSEToClient(clientId, JSON.stringify({ message: "Hello!" }), "test");
```

### Broadcast Event to All Clients

```ts
broadcastSSE(JSON.stringify({ message: "System-wide update" }), "broadcast");
```

### Event Naming Conventions

- Use the `event` parameter to name your event (e.g., `"test"`, `"notification"`, `"broadcast"`).
- If you omit the event name, the event will be sent as the default event and received via `onmessage` on the client.

---

## 3. Frontend Integration Example

```tsx
const es = new EventSource("/api/sse");

// Listen for default events (no event name)
es.onmessage = (event) => {
  console.log("Default event:", event.data);
};

// Listen for custom events
es.addEventListener("test", (event) => {
  console.log("Test event:", event.data);
});
es.addEventListener("broadcast", (event) => {
  console.log("Broadcast event:", event.data);
});

// Listen for connection and ping events
es.addEventListener("connected", (event) => {
  const data = JSON.parse(event.data);
  console.log("Connected! Your clientId:", data.clientId);
});
es.addEventListener("ping", (event) => {
  // Used to keep the connection alive
});
```

---

## 4. How to Get Your clientId

- When the client connects, the server sends a `connected` event with a payload containing your `clientId`:
  ```json
  { "message": "connected", "clientId": "abc123" }
  ```
- Save this `clientId` on the frontend if you want to receive targeted events from the backend.

---

## 5. Notes & Best Practices

- **Do not use SSE for sensitive or high-frequency data**; it is best for notifications and lightweight real-time updates.
- **In production with multiple server instances**, you must implement a shared pub/sub layer (e.g., Redis) to synchronize events across all processes.
- **Always handle disconnects and errors** on the frontend and reconnect as needed.
- **Keep payloads small and JSON-encoded** for best performance.

---

## 6. Example: Sending a Notification from a Backend Module

```ts
import { sendSSEToClient } from "@/lib/sse/sse-api";

export async function notifyUser(userId: string, message: string) {
  // Lookup clientId for the user (implement your own mapping)
  const clientId = await getClientIdForUser(userId);
  if (clientId) {
    sendSSEToClient(clientId, JSON.stringify({ message }), "notification");
  }
}
```

---

## 7. Troubleshooting

- If the frontend does not receive events, check:
  - The client is connected and status is "Connected".
  - The correct event name is used in both backend and frontend.
  - The `clientId` matches between backend and frontend.
  - No CORS or network errors in the browser console.
- For multi-instance deployments, implement Redis pub/sub for cross-process event delivery.

---

## 8. References

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

---

For further questions, contact the core backend team or check the code in `src/lib/sse/` and `src/app/api/sse/`.
