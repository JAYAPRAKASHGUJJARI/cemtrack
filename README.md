# 🏭 CemTrack — Real-Time Cement Plant Monitoring System

![CemTrack Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) [Node](https://img.shields.io/badge/Node.js-v24-green) ![React](https://img.shields.io/badge/React-v19-blue)

> An Industry 4.0 solution that brings real-time IoT monitoring, WebSocket communication, role-based access control, and AI-powered analytics to cement plant operations — reducing problem response time from hours to seconds.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ Frontend | [https://cemtrack.vercel.app](https://cemtrack.vercel.app) |
| ⚙️ Backend API | [https://cemtrack-backend.onrender.com](https://cemtrack-backend.onrender.com) |
| 📦 GitHub | [https://github.com/JAYAPRAKASHGUJJARI/cemtrack](https://github.com/JAYAPRAKASHGUJJARI/cemtrack) |

---

## 📸 Screenshots

> **Add your screenshots here!**
> 
> Take screenshots of each page and save them in a folder called `screenshots/` inside your project root, then replace the placeholders below.

### Dashboard
<img width="1462" height="832" alt="image" src="https://github.com/user-attachments/assets/e97c65a8-9e21-4c59-9567-6e935bc80525" />

*Live dashboard showing all 17 parameters with real-time updates*

### Parameters Chart
<img width="1465" height="827" alt="image" src="https://github.com/user-attachments/assets/50d6d0a1-3e7c-4cda-9ae0-1b4f98e95126" />

*Historical trend charts with 1h/6h/12h/24h time ranges*

### Alerts Page
<img width="1464" height="832" alt="image" src="https://github.com/user-attachments/assets/7f673d59-ccbe-4245-af7b-d97acef3e69f" />

*Real-time alerts with acknowledge and delete options*

### Manual Entry
<img width="1465" height="828" alt="image" src="https://github.com/user-attachments/assets/0e058676-37a8-46e6-96a1-c931290d65bc" />

*Operators can manually record sensor readings*

### AI Insights
<img width="1464" height="830" alt="image" src="https://github.com/user-attachments/assets/f59a5bdd-ad93-4235-ad6f-6849f5c8700a" />

*NVIDIA Llama 3.1 AI-powered plant analysis*

### Reports
<img width="1463" height="829" alt="image" src="https://github.com/user-attachments/assets/0520139e-efe4-4470-af12-b7e1ebebc320" />

*Shift performance reports and analytics*

### Shifts
<img width="1461" height="826" alt="image" src="https://github.com/user-attachments/assets/15bdbd26-4ccc-475e-8bb0-f88eb8a1673c" />

*Shift tracking with start/end and history*

### User Management
<img width="1455" height="683" alt="image" src="https://github.com/user-attachments/assets/38e71733-7d2d-40d9-a4b1-64f86a757192" />

*Admin panel for managing users and roles*

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Monitored Parameters](#monitored-parameters)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Security](#security)
- [AI Integration](#ai-integration)
- [Real-Time Features](#real-time-features)
- [Future Enhancements](#future-enhancements)

---

## 📖 Overview

CemTrack is a full-stack Industry 4.0 solution built to solve a real problem — cement plant operators currently check machines manually every few hours, missing problems until damage occurs.

CemTrack monitors **17 critical parameters** across kiln, raw mill, and cement mill sections in real-time, automatically detects anomalies, generates instant alerts, and uses **NVIDIA Llama 3.1 AI** for intelligent recommendations.

### Why CemTrack?
- ✅ Reduces problem response time from **hours to seconds**
- ✅ Monitors **17 parameters** simultaneously 24/7
- ✅ **AI-powered** root cause analysis and recommendations
- ✅ **Role-based access** for operators, managers, and admins
- ✅ **WebSocket** real-time communication
- ✅ **Zero cost** — built entirely on free tiers

---

## ✨ Features

### 📊 Live Dashboard
- Real-time parameter cards for all 17 sensors
- Live updates every 5 seconds via WebSocket
- Color-coded status (Normal 🟢 / Warning 🟡 / Critical 🔴)
- Progress bars showing value within safe range
- Clickable alert stats — navigate directly to alerts
- Shift start/end control with handover notes

### 📈 Parameters Page
- Historical trend charts using Recharts
- Select any of 17 parameters grouped by section
- Time range: 1h / 6h / 12h / 24h
- Live chart updates as new data arrives
- Min/Max/Average statistics display
- Safe range reference lines on chart

### 🚨 Alerts Page
- Real-time alert notifications via Socket.IO
- Filter by: All / Unacknowledged / Critical / Warning
- Acknowledge alerts (synced across all connected clients)
- Delete alerts (manager/admin only)
- IST timezone display with relative time (e.g. "5m ago")
- Two alert types: Threshold and Spike detection
- 5-minute cooldown to prevent duplicate alerts

### ✏️ Manual Entry
- Operators can manually record sensor readings
- Real-time value status indicator (Normal/Warning/Critical)
- Shows safe range for selected parameter
- View all manual entries from all operators
- Delete own entries only
- Shows operator name, role and IST timestamp

### 📋 Reports
- Shift performance reports (4h / 8h / 12h / 24h)
- Parameter statistics (avg, min, max per parameter)
- Alert breakdown by status
- Most problematic parameters ranking
- Manual entries with operator details

### 🤖 AI Insights (NVIDIA Llama 3.1)
- **Ask AI** — Natural language queries about plant status
- **Analyze Alert** — AI root cause analysis for any alert
- **Shift Report** — AI-generated shift summary
- Available to all roles

### 🕐 Shifts
- Start/End shift tracking per operator
- Morning / Afternoon / Night shift auto-detection (IST)
- Handover notes when ending shift
- View all currently active shifts
- Complete shift history with duration
- Auto-cleanup after 12 months

### 👥 User Management (Admin Only)
- View all users with roles and status
- Add new users with name, email, password, role
- Change user roles (operator/manager/admin)
- Enable/disable user accounts
- Reset any user's password
- Delete users (cannot delete own account)

### 🔑 Change Password
- Available from login page — no login required
- Requires current password verification
- Minimum 6 character validation

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + Vite | UI framework and build tool |
| React Router DOM | Client-side SPA routing |
| Socket.IO Client | Real-time WebSocket communication |
| Recharts | Interactive trend charts |
| Axios | HTTP API calls with JWT auto-injection |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| Socket.IO | Real-time bidirectional communication |
| PostgreSQL (Neon) | Cloud database |
| JWT | Authentication tokens (7-day expiry) |
| bcryptjs | Password hashing (10 salt rounds) |
| NVIDIA Llama 3.1 | AI recommendations and analysis |

### DevOps & Infrastructure
| Service | Purpose | Cost |
|---------|---------|------|
| Render | Backend hosting | Free |
| Vercel | Frontend hosting | Free |
| Neon | PostgreSQL cloud database | Free |
| UptimeRobot | Keeps backend alive 24/7 | Free |
| GitHub | Version control | Free |

**Total Cost: ₹0** 🎉

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Vercel)                      │
│              React + Vite + Recharts                     │
│  Dashboard | Parameters | Alerts | Reports | AI | Shifts │
└──────────────────┬──────────────────┬───────────────────┘
                   │ REST API (Axios)  │ WebSocket (Socket.IO)
                   ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Render)                       │
│                 Node.js + Express                        │
│                                                          │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────────┐ │
│  │  Auth   │ │Readings  │ │Alerts  │ │   AI Routes   │ │
│  │ Routes  │ │  Routes  │ │Routes  │ │ NVIDIA Llama  │ │
│  └─────────┘ └──────────┘ └────────┘ └───────────────┘ │
│  ┌─────────┐ ┌──────────┐ ┌────────┐                    │
│  │  Users  │ │ Reports  │ │Shifts  │                    │
│  │ Routes  │ │  Routes  │ │Routes  │                    │
│  └─────────┘ └──────────┘ └────────┘                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Simulator (every 5 sec)                  │   │
│  │  Generates data → DB save (every 1 min)          │   │
│  │  Socket.IO push (every 5 sec) → Live Dashboard   │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │    Safety Check (Threshold + Spike Detection)    │   │
│  │    5-minute cooldown to prevent spam alerts      │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │    Cleanup Job (every 24 hours)                  │   │
│  │    Readings > 7 days → Delete                    │   │
│  │    Alerts > 7 days → Delete                      │   │
│  │    Shifts > 12 months → Delete                   │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL (Neon)                       │
│   7 Tables: users, parameters_config, sensor_readings,  │
│             alerts, shifts, shift_reports, audit_log    │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### 7 Tables

```sql
1. users
   → id, name, email, password, role, is_active, created_at
   → roles: operator / manager / admin

2. parameters_config
   → 17 parameters with min/max warning and safe ranges
   → sections: kiln / raw_mill / cement_mill / production

3. sensor_readings
   → all readings from simulator + manual entry
   → cleanup: deletes readings older than 7 days

4. alerts
   → auto-created when safety check fails
   → types: threshold / spike
   → cleanup: deletes alerts older than 7 days

5. shifts
   → morning / afternoon / night shifts per operator
   → cleanup: deletes shifts older than 12 months

6. shift_reports
   → per shift statistics (future use)

7. audit_log
   → tracks user actions (future use)
```

### Data Retention Policy
| Data | Retention |
|------|-----------|
| Sensor Readings | 7 days |
| Alerts | 7 days |
| Shifts | 12 months |

---

## 🔌 API Routes

### Authentication
```
POST   /auth/register          → Register (first user = admin)
POST   /auth/login             → Login, returns JWT token
GET    /auth/me                → Get current user info
PATCH  /auth/change-password   → Change own password
```

### Readings
```
POST   /readings               → Save new reading + safety check
GET    /readings/latest        → Latest value per parameter
GET    /readings/history       → Historical data with filters
GET    /readings/trend         → Trend data by hours
DELETE /readings/:id           → Delete own reading (operator)
```

### Alerts
```
GET    /alerts                 → All alerts (limit 100)
GET    /alerts/active          → Unacknowledged alerts
GET    /alerts/stats           → 24hr statistics
PATCH  /alerts/:id/acknowledge → Acknowledge alert
DELETE /alerts/:id             → Delete alert (manager/admin)
```

### Users (Admin Only)
```
GET    /users                     → All users
PATCH  /users/:id/role            → Change role
PATCH  /users/:id/status          → Enable/disable
PATCH  /users/:id/reset-password  → Reset password
DELETE /users/:id                 → Delete user
```

### AI
```
POST   /ai/analyze  → Analyze specific alert with AI
POST   /ai/query    → Natural language plant query
POST   /ai/report   → Generate AI shift summary
```

### Reports
```
GET    /reports/shift   → Shift report with parameter stats
GET    /reports/daily   → Daily summary (7 days)
```

### Shifts
```
GET    /shifts/current     → Current active shift for user
GET    /shifts/active-all  → All currently active shifts
POST   /shifts/start       → Start new shift
PATCH  /shifts/:id/end     → End current shift with notes
GET    /shifts/history     → Past completed shifts
```

---

## 📊 Monitored Parameters

### 🔥 Kiln Section
| Parameter | Unit | Safe Min | Safe Max |
|-----------|------|----------|----------|
| Burning Zone Temperature | °C | 1400 | 1500 |
| Kiln Inlet Temperature | °C | 900 | 1100 |
| Kiln Speed | RPM | 3.0 | 4.5 |
| Kiln Feed Rate | T/hr | 150 | 200 |
| Coal Feed Rate | T/hr | 15 | 25 |

### ⚙️ Raw Mill Section
| Parameter | Unit | Safe Min | Safe Max |
|-----------|------|----------|----------|
| Raw Mill Feed Rate | T/hr | 200 | 250 |
| Raw Mill Outlet Temperature | °C | 80 | 95 |
| Raw Mill Power Consumption | kWh/T | 15 | 18 |
| Raw Mill Speed | RPM | 14 | 16 |

### 🏭 Cement Mill Section
| Parameter | Unit | Safe Min | Safe Max |
|-----------|------|----------|----------|
| Cement Mill Feed Rate | T/hr | 150 | 180 |
| Cement Mill Power Consumption | kWh/T | 28 | 35 |
| Cement Mill Outlet Temperature | °C | 100 | 120 |
| Cement Fineness | cm²/g | 3200 | 3500 |

### 📦 Production KPIs
| Parameter | Unit | Safe Min | Safe Max |
|-----------|------|----------|----------|
| Clinker Production | T/day | 2800 | 3200 |
| Cement Production | T/day | 3300 | 3700 |
| Heat Consumption | kcal/kg | 750 | 850 |
| Equipment Availability | % | 90 | 100 |

---

## 👥 User Roles

| Role | Dashboard | Parameters | Alerts | Manual Entry | AI Insights | Shifts | Reports | User Management |
|------|-----------|------------|--------|--------------|-------------|--------|---------|-----------------|
| **Operator** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Manager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (or free [Neon](https://neon.tech) account)
- NVIDIA API key (free at [build.nvidia.com](https://build.nvidia.com))

### 1. Clone the repository
```bash
git clone https://github.com/JAYAPRAKASHGUJJARI/cemtrack.git
cd cemtrack
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=8080
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_secret_key_here
NVIDIA_API_KEY=your_nvidia_api_key
```

Setup database:
```bash
node schema.js   # Creates all 7 tables
node seed.js     # Seeds 17 parameter configurations
```

Start backend:
```bash
node index.js
```

You should see:
```
🚀 CemTrack server running on port 8080
🤖 Simulator started!
✅ Database connected successfully!
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### 4. Create Admin Account
Send a POST request to create your first admin account:
```
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "name": "Your Name",
  "email": "admin@cemtrack.com",
  "password": "your_password"
}
```
> ⚠️ The **first registered user** is automatically assigned the **admin** role.

---

## 🌐 Deployment

### Backend on Render
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** Free
4. Add environment variables from your `.env`
5. Deploy!

### Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework:** Vite (auto-detected)
4. Deploy!

### Keep Backend Alive (Important!)
Render free tier spins down after 15 minutes of inactivity.

Add your backend URL to [UptimeRobot](https://uptimerobot.com) (free) to ping every 5 minutes and keep it alive 24/7.

---

## 📁 Project Structure

```
cemtrack/
├── backend/
│   ├── routes/
│   │   ├── auth.js          → Register, login, change password
│   │   ├── readings.js      → Sensor data CRUD
│   │   ├── alerts.js        → Alerts management
│   │   ├── users.js         → User management (admin)
│   │   ├── ai.js            → NVIDIA AI integration
│   │   ├── reports.js       → Shift reports
│   │   └── shifts.js        → Shift tracking
│   ├── middleware/
│   │   ├── auth.js          → JWT token verification
│   │   └── roles.js         → RBAC role checking
│   ├── simulator/
│   │   └── simulator.js     → Generates fake sensor data
│   │                           (live every 5s, saves every 1min)
│   ├── socket/
│   │   └── socketHandler.js → Socket.IO event handlers
│   ├── utils/
│   │   └── safetyCheck.js   → Threshold + spike detection
│   │                           with 5-min duplicate cooldown
│   ├── config.js            → dotenv configuration
│   ├── db.js                → PostgreSQL connection pool
│   ├── schema.js            → Creates all 7 database tables
│   ├── seed.js              → Seeds 17 parameter configs
│   └── index.js             → Express server + Socket.IO
│
└── frontend/
    ├── public/
    └── src/
        ├── pages/
        │   ├── Login.jsx            → Login form
        │   ├── ChangePassword.jsx   → Change password (pre-login)
        │   ├── Dashboard.jsx        → Live parameter gauges
        │   ├── Parameters.jsx       → Historical trend charts
        │   ├── Alerts.jsx           → Real-time alerts
        │   ├── ManualEntry.jsx      → Manual sensor entry
        │   ├── Reports.jsx          → Shift analytics
        │   ├── AIInsights.jsx       → AI analysis
        │   ├── Shifts.jsx           → Shift management
        │   └── UserManagement.jsx   → Admin user panel
        ├── components/
        │   ├── Navbar.jsx           → Navigation bar
        │   └── ProtectedRoute.jsx   → Auth + role guard
        ├── context/
        │   ├── AuthContext.jsx      → Global auth state
        │   └── SocketContext.jsx    → Socket.IO connection
        └── api/
            └── axios.js             → Axios with JWT interceptor
```

---

## 🔒 Security Features

- JWT authentication with 7-day token expiry
- Password hashing with bcryptjs (salt rounds: 10)
- Role-based access control (RBAC) on all routes
- Protected API routes with middleware chain
- Cannot delete your own admin account
- Operators can only delete their own readings
- Admin-only user management endpoints

---

## 🤖 AI Integration

CemTrack uses **NVIDIA Llama 3.1 8B Instruct** model via NVIDIA's free API:

### Features
- **Alert Analysis** — Root cause + immediate actions + long-term recommendations
- **Plant Query** — Natural language questions with live plant data as context
- **Shift Report** — Professional AI-generated shift handover report

### How it works
```
User asks question
      ↓
Backend fetches live readings + active alerts from DB
      ↓
Sends to NVIDIA Llama 3.1 with plant context
      ↓
AI analyzes and generates actionable response
      ↓
Response displayed in AI Insights page
```

---

## 📡 Real-Time Features

CemTrack uses **Socket.IO** for instant bidirectional updates:

| Event | Direction | Trigger | Effect |
|-------|-----------|---------|--------|
| `new-reading` | Server → All Clients | Every 5 seconds | Updates dashboard values |
| `new-alert` | Server → All Clients | Safety check fails | Shows alert notification |
| `alert-acknowledged` | Server → All Clients | Operator acknowledges | Removes from all screens |
| `get-active-alerts` | Client → Server | On connection | Fetches current alerts |
| `acknowledge-alert` | Client → Server | Button click | Broadcasts to all |

---

## 🔔 Alert System

### Two Types of Alerts

**1. Threshold Alert**
- Triggered when value goes outside warning range
- Critical: outside safe range completely
- Warning: between safe range and warning range

**2. Spike Alert**
- Triggered when value changes >5% suddenly
- Catches rapid unexpected changes
- Always marked as Critical

### Duplicate Prevention
- 5-minute cooldown per parameter per alert type
- Prevents alert spam from continuous threshold violations

---

## 🎯 Future Enhancements

- [ ] Real PLC/SCADA sensor integration
- [ ] Email/SMS alert notifications
- [ ] Mobile app (React Native)
- [ ] Predictive maintenance using ML
- [ ] Multi-plant support
- [ ] PDF report export
- [ ] Dashboard widget customization
- [ ] Shift scheduling calendar
- [ ] User activity audit log UI

---

## 👨‍💻 Author

**Jaya Prakash Gujjari**
- GitHub: [@JAYAPRAKASHGUJJARI](https://github.com/JAYAPRAKASHGUJJARI)
- Project: [CemTrack Live Demo](https://cemtrack.vercel.app)

---


---

*Built with ❤️ as an Industry 4.0 college project — proving that enterprise-grade solutions can be built at zero cost using modern open-source technologies.*
