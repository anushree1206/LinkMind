# Reply Simulation System for AI Relationship Manager

This system simulates incoming replies for your AI Relationship Manager MVP, providing realistic response patterns for testing and demonstration purposes.

## Features Implemented

### 1. Message Model (`/src/models/Message.js`)
- **Status tracking**: `pending`, `responded`, `no_response`
- **Automatic reply scheduling** with random delays (30s - 5min)
- **Reply content simulation** with realistic responses
- **Response time tracking** for analytics

### 2. Reply Simulation Service (`/src/services/replySimulationService.js`)
- **Automatic scheduling** of fake replies with random delays
- **Response rate calculation**: `(respondedMessages / totalMessages) * 100`
- **Pending follow-ups counting**: Messages with `status = "pending"`
- **Cleanup functionality** for server restarts

### 3. API Endpoints

#### Message Management
- `POST /api/messages` - Create message and auto-schedule reply
- `GET /api/messages` - Get messages with filters
- `GET /api/messages/stats` - Get message statistics
- `PUT /api/messages/:id/status` - Update message status (testing)

#### Analytics Endpoints
- `GET /api/analytics/response-rate` - Overall response rate percentage
- `GET /api/analytics/followups` - Count of pending follow-ups

## Usage Examples

### 1. Send a Message (Auto-schedules Reply)
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "contactId": "CONTACT_ID",
    "content": "Hi! Hope you are doing well.",
    "type": "Email",
    "subject": "Checking in"
  }'
```

### 2. Get Response Rate
```bash
curl -X GET http://localhost:5000/api/analytics/response-rate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "responseRate": 75,
    "description": "75% of your messages have received responses"
  }
}
```

### 3. Get Pending Follow-ups
```bash
curl -X GET http://localhost:5000/api/analytics/followups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "pendingFollowUps": 3,
    "description": "You have 3 messages awaiting responses"
  }
}
```

## How It Works

1. **Message Creation**: When you create a message via `POST /api/messages`, it's saved with `status = "pending"`

2. **Reply Scheduling**: The system automatically schedules a fake reply using `setTimeout()` with a random delay between 30 seconds and 5 minutes

3. **Reply Execution**: When the timeout triggers:
   - Message status changes to `"responded"`
   - A random reply message is added
   - Contact's `lastContacted` field is updated
   - `repliedAt` timestamp is set

4. **Analytics**: Helper functions calculate:
   - **Response Rate**: `(responded messages / total messages) * 100`
   - **Pending Follow-ups**: Count of messages with `status = "pending"`

## Sample Reply Messages
The system randomly selects from realistic replies:
- "Thanks for reaching out!"
- "I appreciate your message. Let me get back to you soon."
- "Got your message, thanks!"
- "Thanks for the update. I'll review this and respond accordingly."
- "Appreciate you thinking of me. Let's connect soon!"

## Integration with Existing System

- **Contact Model**: Updates `lastContacted` when replies are received
- **No Breaking Changes**: Extends existing logic without modifying Contact model
- **Clean Architecture**: Separate service layer for reply simulation
- **Server Restart Handling**: Cleanup service reinitializes pending timeouts

## Testing the System

1. Start your backend server
2. Create a few messages using the API
3. Wait 30 seconds to 5 minutes
4. Check the response rate and pending follow-ups endpoints
5. View message status changes in your database

The system is now ready for your hackathon demo! 🚀
