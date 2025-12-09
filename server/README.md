# Socket.IO Server

Real-time messaging server for the support system.

## Setup

```bash
cd server
npm install
```

## Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Environment Variables

The server uses the same `.env` from the parent directory:
- `JWT_SECRET` - Required for token verification
- `SOCKET_PORT` - Server port (default: 3001)
- `NEXT_PUBLIC_APP_URL` - CORS origin (default: http://localhost:3000)

## Events

### Client → Server
- `join-ticket` - Join a ticket room
- `leave-ticket` - Leave a ticket room
- `send-message` - Send a message
- `typing` - Typing indicator
- `ticket-updated` - Ticket status changed

### Server → Client
- `new-message` - New message received
- `user-typing` - User typing status
- `ticket-status-changed` - Ticket was updated
