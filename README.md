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

Notes

Create and view notes

Notes include title, content, tags, and timestamps

Delete notes with immediate UI updates

Tasks

Create and view tasks

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

How authentication works (high level)

User signs in with Google on the frontend

Firebase returns an ID token

The frontend sends this token with every API request

FastAPI verifies the token and identifies the user

All database queries are filtered by the authenticated user

This ensures proper access control and security.

Project Structure
ai-task-manager/
├── backend/
│   ├── main.py          # API routes and authentication
│   ├── models.py        # Database models
│   ├── schemas.py       # Request/response schemas
│   ├── db.py            # Database connection
│   └── create_tables.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main application UI
│   │   └── firebase.js  # Firebase configuration
│   └── index.html
│
└── README.md

Security Notes

Firebase service account credentials are never committed

.env files and secret JSON files are ignored via .gitignore

GitHub secret scanning is enabled

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

It also reflects how modern SaaS applications are structured.

What I’d like to improve next

Editing notes and tasks

Smarter AI suggestions

AI-based task extraction from notes

Deployment and production setup

UI/UX polish and animations

About Me

Shimon Turchak
Junior Software Engineer
📧 shimonturchak2@gmail.com

GitHub: https://github.com/SimonTurchak

I’m actively looking for a junior / entry-level software engineering role and enjoy building practical, end-to-end systems.
