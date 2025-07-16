"use client";
import React, { useEffect, useRef, useState } from "react";

/**
 * SSETestClient: Simple UI to test Server-Sent Events (SSE)
 * Connects to /api/sse and displays the latest message received from the server.
 */
export default function SSETestClient() {
  const [connected, setConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<string>("");
  const [eventType, setEventType] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);

  // Function to connect to SSE endpoint
  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource("/api/sse");
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setLatestEvent("");
      setEventType("");
    };
    es.onmessage = (event) => {
      setLatestEvent(event.data);
      setEventType(event.type || "message");
    };
    es.onerror = () => {
      setConnected(false);
      setLatestEvent("[Error or disconnected]");
      setEventType("");
      es.close();
    };
    // Listen for custom events (e.g., 'connected', 'ping')
    es.addEventListener("connected", (event: MessageEvent) => {
      setLatestEvent(event.data);
      setEventType("connected");
    });
    es.addEventListener("ping", (event: MessageEvent) => {
      setLatestEvent(event.data);
      setEventType("ping");
    });
  };

  // Connect on mount
  useEffect(() => {
    connectSSE();
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 16,
        borderRadius: 8,
        maxWidth: 600,
      }}
    >
      <h2>SSE Test Client</h2>
      <div>
        Status:{" "}
        {connected ? (
          <b style={{ color: "green" }}>Connected</b>
        ) : (
          <b style={{ color: "red" }}>Disconnected</b>
        )}
      </div>
      <button onClick={connectSSE} style={{ margin: "8px 0" }}>
        Reconnect
      </button>
      <div style={{ marginTop: 12 }}>
        <div>
          <b>Latest event type:</b> {eventType}
        </div>
        <div>
          <b>Latest message:</b> <pre>{latestEvent}</pre>
        </div>
      </div>
    </div>
  );
}
