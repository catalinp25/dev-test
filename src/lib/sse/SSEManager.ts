// SSEManager: Manages active SSE client connections in-memory
// Each client is represented by an object with a send function and a close function

export type SSEClient = {
  id: string; // Unique identifier for the client (can be random for now)
  send: (data: string, event?: string) => void;
  close: () => void;
};

export class SSEManager {
  private clients: Map<string, SSEClient> = new Map();

  // Add a new client connection
  addClient(client: SSEClient) {
    this.clients.set(client.id, client);
  }

  // Remove a client connection
  removeClient(clientId: string) {
    this.clients.delete(clientId);
  }

  // Send an event to a specific client
  sendToClient(clientId: string, data: string, event?: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.send(data, event);
    }
  }

  // Broadcast an event to all connected clients
  broadcast(data: string, event?: string) {
    for (const client of this.clients.values()) {
      client.send(data, event);
    }
  }

  // Get the number of active clients
  getClientCount() {
    return this.clients.size;
  }
}
