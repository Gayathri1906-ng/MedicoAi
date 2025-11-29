
# MedicoAi

MedicoAi is a **personal healthcare assistant web application** that helps users manage their health by providing symptom analysis, emergency contacts, health reminders, and quick access to emergency services. It integrates **AI-based symptom analysis** with a **backend database** to store user data and provides instant actions in emergency situations.

---

## Features

### 1. Symptom Analysis
- Enter your symptoms and severity.
- If the symptom record exists in the database, it retrieves the previous analysis.
- If not, AI analyzes the symptoms using **OpenAI API** and stores the result in the database.
- Provides:
  - Summary of symptoms
  - Possible conditions
  - Suggested actions
  - Risk level (low, medium, high)
  - OTC medicines if applicable

### 2. Emergency Numbers
- Quick access to important numbers like:
  - Ambulance (112)
  - Police (100)
  - Helpline (108)

### 3. Personal Emergency Contacts
- Add and manage personal emergency contacts such as family or doctors.
- Call contacts directly from the dashboard.

### 4. Health Reminders
- Set reminders for upcoming health checkups, lab tests, or medication.
- Add optional notes (e.g., fasting required).

### 5. Quick Actions
- Navigate to nearest hospitals using geolocation and Google Maps.
- Request ambulance instantly.
- Notify family or friends via SMS.
- Call your doctor directly.

---

## Tech Stack

- **Frontend:** React, Next.js, TypeScript
- **UI Components:** Shadcn/UI, Lucide Icons
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI:** OpenAI GPT-4o-mini (Chat Completions)
- **Other:** Sonner for toast notifications, Date-fns for formatting

---

## Installation

1. Clone the repository:
git clone https://github.com/<YourUsername>/MedicoAi.git
cd MedicoAi

2.Install dependencies:
npm install

3.Setup environment variables in .env file:
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
OPENAI_API_KEY=<your-openai-api-key>

4.Run the development server:
npm run dev
Open http://localhost:3000
 to view the app.

**How It Works**

Users input symptoms in the Symptom Analysis section.
The system first checks the Supabase database:
If a record exists, it returns previous analysis.
If not, it calls OpenAI API to analyze the symptoms.
Analysis is stored in the backend for future reference.
Users can manage emergency contacts, health reminders, and access quick actions anytime.


