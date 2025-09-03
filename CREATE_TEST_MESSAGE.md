# Quick Test: Create a Message to See Visual Indicators

## Step 1: Get Your JWT Token
1. Open browser dev tools (F12)
2. Go to Application/Storage → Local Storage
3. Copy the `token` value

## Step 2: Get a Contact ID
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" http://localhost:5000/api/contacts
```
Copy any `_id` from the response.

## Step 3: Create a Test Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "contactId": "CONTACT_ID_HERE",
    "content": "Hi! Hope you are doing well. Would love to catch up soon!",
    "type": "Email",
    "subject": "Catching up"
  }'
```

## Step 4: See the Magic! 🎉
1. **Immediately**: Refresh your dashboard/contacts page
2. **You'll see**: 🟠 Orange "Pending" indicator on the contact card
3. **Wait 30s-5min**: The system will auto-reply
4. **Then you'll see**: ✅ Green "Replied" indicator with reply content
5. **Always visible**: 📊 Response rate percentage badge

## What You'll See:
- **Pending State**: `🟠 Pending` with orange clock icon
- **Replied State**: `✅ Replied` with green checkmark + reply preview
- **Response Rate**: Blue badge showing percentage (e.g., "100% response rate")

The system is fully functional - you just need messages to display the indicators!
