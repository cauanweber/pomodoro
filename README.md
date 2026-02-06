# ⏱️ Pomodoro App

A **fullstack Pomodoro application** focused on **mindful productivity**, featuring authentication, session history, and a **Mobile UX First** experience.

This project was built for portfolio purposes, highlighting practical expertise in **modern frontend development**, **well-structured backend architecture**, and **real database integration**, while maintaining clean, scalable code.

<p>
    <img src="https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white" alt="Node 18+" />
    <img src="https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
    <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma&logoColor=white" alt="Prisma 7" />
    <img src="https://img.shields.io/badge/License-Attribution%20Required-0f766e" alt="Attribution Required License" />
</p>

## ✨ Features

* User authentication (Login & Register)
* Pomodoro timer (Focus / Break)
* Start, Pause and Reset controls
* Internal cycle tracking
* Automatic session recording
* Persistent session history stored in the database
* Responsive interface (Mobile First)
* Visual feedback based on state (colors and animations)
* Customizable durations (focus/break)
* Quick presets (e.g. 25/5, 50/10, 90/15)
* Optional auto-start between focus and break
* Sound feedback when cycles start/end
* Session history with date and time
* Quick Focus/Break toggle shortcut

## ⚙️ Tech Stack

### Frontend

* React 19
* Vite 7
* TypeScript
* Tailwind CSS
* React Router DOM
* Axios
* Motion (animations)
* Lucide Icons

### Backend

* Node.js
* Express 5
* CORS
* TypeScript
* Prisma ORM
* JWT (JSON Web Token)
* BCrypt
* PostgreSQL
* Prisma Adapter PG
* pg (PostgreSQL driver)

### Database

* PostgreSQL

### Infra / DevOps

* Docker
* Docker Compose
* Prisma Migrate
* ESLint

## 🧱 Architecture

The project follows a **modular and scalable architecture**, with a clear separation of responsibilities.

### Backend

```
src/
├─ @types/
│ └─ express.d.ts
├─ lib/
│ ├─ jwt.ts
│ └─ prisma.ts
├─ middlewares/
│ └─ auth.middleware.ts
├─ modules/
│ ├─ auth/
│ │ ├─ auth.controller.ts
│ │ ├─ auth.routes.ts
│ │ └─ auth.service.ts
│ └─ pomodoro/
│   ├─ pomodoro.controller.ts
│   ├─ pomodoro.routes.ts
│   └─ pomodoro.service.ts
├─ app.ts
└─ server.ts
```

* @types/ — type extensions (e.g. express.d.ts)
* lib/ — core utilities (JWT, Prisma)
* middlewares/ — authentication and route protection
* modules/ — domain modules (auth, pomodoro)
* modules/auth/ — authentication logic (controller, service, routes)
* modules/pomodoro/ — pomodoro logic (controller, service, routes)
* app.ts — Express configuration (middlewares + routes)
* server.ts — server bootstrap (listen)

### Frontend

```
src/
├─ components/
│ └─ ProtectedRoute.tsx
├─ context/
│ ├─ AuthContext.tsx
│ ├─ authContext.ts
│ └─ useAuth.ts
├─ hooks/
│ └─ usePomodoro.ts
├─ pages/
│ ├─ Login.tsx
│ ├─ Register.tsx
│ └─ Dashboard.tsx
├─ services/
│ ├─ api.ts
│ └─ pomodoroService.ts
├─ styles/
│ ├─ global.css
│ └─ index.css
├─ types/
│ ├─ auth.ts
│ └─ pomodoro.ts
├─ utils/
│ ├─ microcopy.ts
│ └─ time.ts
├─ App.tsx
└─ main.tsx
```

* components/ — reusable UI components
* context/ — authentication context and global hooks
* hooks/ — custom hooks (e.g. pomodoro)
* pages/ — main application pages
* services/ — API communication layer
* styles/ — global and base styles
* types/ — TypeScript interfaces and types
* utils/ — utility functions (time, microcopy)
* App.tsx — routing and main layout
* main.tsx — React entry point

## 🚀 Running Locally

### Prerequisites

* Node.js 18+
* Git
* PostgreSQL (or Docker + Docker Compose)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/cauanweber/pomodoro.git
cd pomodoro
```

### 2️⃣ Backend setup
```bash
cd server
npm install
```

Rename .env.example to .env:
```bash
DATABASE_URL=...    # PostgreSQL connection string
JWT_SECRET=...      # secret key used to sign tokens
CORS_ORIGIN=...     # allowed frontend URL for the API
```

Initialize the database and start the API (Using Docker):
```bash
docker compose up -d        # starts PostgreSQL via Docker
npx prisma migrate deploy   # applies migrations
npx prisma generate         # generates Prisma Client
npm run dev                 # starts backend in development mode
```

Initialize the database and start the API (Using local PostgreSQL):
```bash
createdb pomodoro          # creates local PostgreSQL database
npx prisma migrate dev     # creates/applies migrations
npx prisma generate        # generates Prisma Client
npm run dev                # starts backend in development mode
```

Choose only one of the options above.
The API will be available at:
```bash
http://localhost:3333
```

### 3️⃣ Frontend
```bash
cd app
npm install
```

Rename .env.example to .env:
```bash
VITE_API_URL=... # API base URL used by the frontend
```

Start the app:
```bash
npm run dev
```

The application will be available at:
```bash
http://localhost:5173
```

## 🚀 Run and test in production

### Backend (production)
```bash
cd server
npm install
npm run build
npm run start
```

API will be available at:
```bash
http://localhost:3333
```

### Frontend (production)
```bash
cd public
npm install
npm run build
npm run preview
```

The app will be available at:
```bash
http://localhost:4173
```

## End-to-end test
* Keep the backend running (npm run start)
* Run the frontend preview (npm run preview)
* Open http://localhost:4173
* Test login/register and history

## Notes
* Portfolio-focused project: ready for local demos and simple deployments.
* For real production use, it is recommended to add rate limiting, schema validation, and security headers.

## License
This project is distributed under the “Attribution Required” license (author credit required).