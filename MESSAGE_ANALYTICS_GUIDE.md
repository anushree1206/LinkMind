# Message Reply Analytics - Where to Check

## 🎯 API Endpoints for Message Analytics

### 1. Overall Response Rate
```bash
GET http://localhost:5000/api/analytics/response-rate
```
**Response:**
```json
{
  "success": true,
  "data": {
    "responseRate": 75,
    "description": "75% of your messages have received responses"
  }
}
```

### 2. Pending Follow-ups Count
```bash
GET http://localhost:5000/api/analytics/followups
```
**Response:**
```json
{
  "success": true,
  "data": {
    "pendingFollowUps": 3,
    "description": "You have 3 messages awaiting responses"
  }
}
```

### 3. Detailed Message Statistics
```bash
GET http://localhost:5000/api/messages/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalMessages": 10,
    "pendingMessages": 3,
    "respondedMessages": 7,
    "noResponseMessages": 0,
    "responseRate": 70,
    "pendingFollowUps": 3,
    "averageResponseTimeHours": 2
  }
}
```

### 4. Individual Contact Messages
```bash
GET http://localhost:5000/api/messages?contactId=CONTACT_ID
```

## 🖥️ Frontend Integration

### Contact Cards Show:
- **Reply Status Icons**: ✅ Replied, 🟠 Pending, ⚪ No reply
- **Response Rate**: "75% response rate" badge
- **Last Reply Date**: When they last responded
- **Reply Content**: Preview of their actual reply

### Where to See This:
1. **Dashboard** → Recent Contacts section
2. **Contacts** page → All contact cards
3. **Individual Contact Details** → Message history

## 🧪 Testing the System

### Step 1: Send a Test Message
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

### Step 2: Wait for Auto-Reply
- System automatically schedules reply in 30 seconds - 5 minutes
- Contact card will update to show "Replied" status
- Response rate will be recalculated

### Step 3: Check Analytics
- Visit `/analytics` page for overall stats
- Check contact cards for individual reply status
- Use API endpoints for programmatic access

## 📊 Real-Time Updates

The system provides:
- **Automatic reply simulation** with realistic delays
- **Real-time status updates** on contact cards
- **Accurate response rate calculations** based on actual message data
- **Reply content preview** showing what contacts "said"

## 🎯 Key Features

1. **Visual Indicators**: Color-coded status on every contact
2. **Response Rates**: Calculated per contact and overall
3. **Reply Tracking**: Timestamps and content of responses
4. **Pending Alerts**: Clear indication of awaiting responses
5. **Analytics Integration**: Ready for dashboard widgets

Your reply simulation system is now fully functional and integrated! 🚀
