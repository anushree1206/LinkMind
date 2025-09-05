🌐 LinkMind – AI Relationship Human Connection Manager

Avoid weak ties. Strengthen human connections.
LinkMind helps professionals manage, nurture, and grow meaningful relationships using AI-driven insights and real-time interaction tracking.

📌 Features

✅ Contact Management – Add, edit, and organize contacts (name, company, email, relationship strength, tags).
✅ Real Messaging & Email Simulation – Send message/email, auto-log interactions, update contact history.
✅ AI Insights Dashboard – See:

Total contacts

Recent activity

Relationship distribution (Strong, Medium, Weak, At-Risk)

Top 3 At-Risk contacts

AI recommendations (who to reach out to)
✅ AI Draft Messaging – Generate message/email drafts tailored to tone + history using OpenAI/NLP.
✅ Analytics Page – Deeper insights into relationship health & communication patterns.
✅ Background Sync – Simulate "Sync with LinkedIn" → new contacts auto-added.
✅ Real-Time Updates – Optimistic UI updates without refresh.
✅ Secure Auth – JWT-based authentication for all routes.

🏗 Tech Stack

Frontend:

Next.js (React)

TailwindCSS + shadcn/ui for UI

Recharts (relationship distribution charts)

Axios (API calls)

Backend:

Node.js + Express

MongoDB (Mongoose ODM)

JWT Auth (jsonwebtoken, bcrypt for passwords)

AI / NLP:

OpenAI API (GPT) for draft generation & recommendations


📂 Project Structure
LinkMind/
│── backend/
│   ├── models/Contact.js       # Contact schema (interactions, lastContacted, etc.)
│   ├── routes/contacts.js      # CRUD + interactions
│   ├── routes/dashboard.js     # Dashboard summary (AI insights, distribution)
│   ├── middleware/auth.js      # JWT auth
│   └── server.js               # Express server
│
│── frontend/
│   ├── app/dashboard/          # Dashboard page (cards, at-risk, insights, pie chart)
│   ├── app/contacts/           # Contacts page (fetch/add/send message/email)
│   ├── app/analytics/          # Analytics page (AI insights)
│   ├── components/             # UI components (cards, modals, charts)
│   └── utils/api.js            # Axios instance with JWT
│
│── README.md
│── package.json

⚡ API Endpoints
Contacts

GET /contacts → Fetch all contacts

POST /contacts → Add new contact

POST /contacts/:id/interactions → Add interaction (message/email, updates lastContacted)

GET /contacts/recent → Recent contacts (sorted by lastContacted)

Dashboard

GET /dashboard/summary → Returns:

total contacts

this week’s activity

relationship distribution (Strong/Medium/Weak/At-Risk)

top 3 at-risk contacts

AI priority suggestions

Sync

POST /contacts/sync → Inserts fake contacts (simulate LinkedIn sync)

🔐 Authentication

JWT required for all /contacts/* and /dashboard/* endpoints.

Include token in Authorization: Bearer <token> header.

🚀 Getting Started
1️⃣ Clone repo
git clone https://github.com/<your-username>/LinkMind.git
cd LinkMind

2️⃣ Backend Setup
cd backend
npm install
npm start


Configure .env with:

MONGO_URI=mongodb://127.0.0.1:27017/linkmind
JWT_SECRET=your_jwt_secret

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev


App runs at: http://localhost:3000

🎯 Demo Flow

Login → Dashboard loads.

Click Add Contact → Appears instantly in Contacts + Dashboard.

Click Send Message → AI draft shown → Send → Contact moves to recent.

Dashboard updates: lastContacted → Today, at-risk count decreases.

Click View Insights → Goes to Analytics page (AI-driven).

Click Sync with LinkedIn → New contacts auto-appear (background sync).

🧠 AI Features

AI Draft Messages → OpenAI generates polite, context-aware message drafts.

Risk Detection → Weak/At-Risk classification based on inactivity.

AI Insights → Suggests who to prioritize for better relationship management.


🤝 Contributors

👨‍💻 Built with ❤️ by Anu for Hackathon Presentation.

✨ With LinkMind, never lose touch with the people who matter most!
