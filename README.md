AI Task Manager

AI Task Manager is a full-stack web application I built to practice software engineering skills.
It allows users to manage notes and tasks securely, with Google authentication and a built-in AI assistant that understands their data.

What does the app do?

After signing in with Google, each user gets their own private workspace where they can:
Create and manage personal notes
Create and manage tasks with status and priority
Chat with an assistant that can summarize notes and suggest next actions
All data is scoped per user and protected end-to-end.

Key Features

Authentication
Google Sign-In using Firebase Authentication
Backend verification of Firebase ID tokens
Each user can access only their own notes and tasks
Create and view notes & tasks
Notes include title, content, tags, and timestamps
Delete notes with immediate UI updates


Each task has:

Status (To do / In progress / Done)
Priority (Low / Medium / High)
Delete tasks safely with confirmation
AI Assistant
Simple chat interface inside the app
The assistant has access to the user’s notes and tasks
Can:
Summarize notes
Summarize tasks
Suggest what to work on next
Built in a way that makes it easy to replace with a real LLM later (OpenAI / Gemini)

Tech Stack
Frontend

React (Vite)
Tailwind CSS
Axios
Firebase Web SDK
Backend
FastAPI
SQLAlchemy
PostgreSQL
Firebase Admin SDK
Database

PostgreSQL with relational tables:
Users
Notes
Tasks

Running the project locally
Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Frontend
cd frontend
npm install
npm run dev

Why I built this project

I built this project to practice building a real full-stack application, not just isolated features.
It helped me gain hands-on experience with authentication, API design, database modeling, and frontend-backend integration.

About Me

Shimon Turchak
Software Engineer
📧 shimonturchak2@gmail.com

GitHub: https://github.com/SimonTurchak

