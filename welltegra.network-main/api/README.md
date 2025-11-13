# WellTegra Procedure API

REST API for managing well operation procedures with real-time updates via Kafka.

## Features

- ✅ **JWT Authentication** - Secured with Catriona's auth framework
- ✅ **CRUD Operations** - Full Create, Read, Update, Delete for procedures
- ✅ **Kafka Integration** - Real-time updates broadcast to WebSocket clients
- ✅ **RESTful Design** - Standard HTTP methods and status codes

## Quick Start

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Environment Variables

Create a `.env` file in the `api/` directory:

```env
PORT=3001
JWT_SECRET=your-secret-key-here
KAFKA_BROKER=localhost:9092
```

### 3. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication

All endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Get Procedures

```http
GET /api/v1/procedures/:wellId
```

**Response:**
```json
{
  "success": true,
  "wellId": "W666",
  "checklist": [
    {
      "id": "step-1",
      "title": "Pre-Spud Meeting",
      "description": "Complete pre-spud safety meeting",
      "status": "completed",
      "assignee": "Finlay MacLeod",
      "timestamp": "2024-11-05T08:00:00Z",
      "wellId": "W666"
    }
  ],
  "count": 1
}
```

### Create Step

```http
POST /api/v1/procedures/:wellId/step
Content-Type: application/json

{
  "title": "Test BOP",
  "description": "Pressure test BOP to 5000 PSI",
  "assignee": "Rowan Ross"
}
```

**Response:**
```json
{
  "success": true,
  "step": {
    "id": "step-1699253568",
    "title": "Test BOP",
    "description": "Pressure test BOP to 5000 PSI",
    "status": "pending",
    "assignee": "Rowan Ross",
    "timestamp": "2024-11-06T10:30:00Z",
    "wellId": "W666"
  }
}
```

### Update Step

```http
PUT /api/v1/procedures/step/:stepId
Content-Type: application/json

{
  "status": "in-progress"
}
```

**Response:**
```json
{
  "success": true,
  "step": {
    "id": "step-1",
    "status": "in-progress",
    "timestamp": "2024-11-06T11:00:00Z"
  }
}
```

### Delete Step

```http
DELETE /api/v1/procedures/step/:stepId
```

**Response:**
```json
{
  "success": true,
  "message": "Step deleted successfully"
}
```

## Kafka Integration

When a procedure is created, updated, or deleted, the API publishes a message to the `procedure-update` Kafka topic:

```json
{
  "wellId": "W666",
  "checklist": [...],
  "timestamp": 1699253568
}
```

The WebSocket service consumes this topic and broadcasts updates to all connected clients in real-time.

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "kafka": "connected",
  "timestamp": "2024-11-06T12:00:00Z"
}
```

## Data Store

Currently uses in-memory storage. For production, replace with:
- PostgreSQL for relational data
- MongoDB for document storage
- Redis for caching

## Security

- JWT tokens are verified on every request
- Invalid/expired tokens return 401/403 errors
- User information extracted from JWT payload
- CORS enabled for frontend integration

## Development

### Testing with cURL

```bash
# Get procedures
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/v1/procedures/W666

# Create step
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"New Step","description":"Test step"}' \
     http://localhost:3001/api/v1/procedures/W666/step

# Update step
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status":"completed"}' \
     http://localhost:3001/api/v1/procedures/step/step-1
```

### Testing with Postman

1. Import the endpoints into Postman
2. Add Authorization header with JWT token
3. Test CRUD operations

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Kubernetes

Deploy with ConfigMap for environment variables and Secret for JWT_SECRET.

## Integration with Frontend

The `planner-v2.js` file in the frontend makes `fetch()` calls to these endpoints:

```javascript
// Load procedures
const response = await fetch(`${API_BASE}/api/v1/procedures/${wellId}`, {
    headers: {
        'Authorization': `Bearer ${jwtToken}`
    }
});

// Update step status
await fetch(`${API_BASE}/api/v1/procedures/step/${stepId}`, {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'completed' })
});
```

## Troubleshooting

### Kafka Connection Failed

If Kafka is not available, the API will still function but real-time updates won't work. Check:
- Kafka broker is running on `localhost:9092`
- Network connectivity
- Firewall rules

### JWT Verification Failed

Ensure the `JWT_SECRET` matches the one used to sign tokens in Catriona's auth service.

## Future Enhancements

- [ ] Database integration (PostgreSQL)
- [ ] Step ordering/reordering
- [ ] Attachments (files, images)
- [ ] Comments/notes on steps
- [ ] Audit log for all changes
- [ ] Bulk operations
- [ ] Procedure templates
- [ ] Role-based permissions (who can edit/delete)
