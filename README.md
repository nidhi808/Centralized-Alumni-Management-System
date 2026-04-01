# 🎓 Centralized Alumni Management System

<div align="center">

![Alumni Management System](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A comprehensive, modern web platform that bridges students, faculty, alumni, and administrators into one unified ecosystem.**

[Features](#-key-features) · [Tech Stack](#️-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [Screenshots](#-screenshots) · [Contributing](#-contributing)

</div>

---

## 📌 Overview

The **Centralized Alumni Management System** is a full-stack web application designed to eliminate the silos between an institution's key stakeholders. Rather than siloed portals for just alumni or just admins, this platform creates a living, breathing 4-way ecosystem — connecting **Students**, **Faculty**, **Alumni**, and **Administrators** in real time.

From career mentorship and job postings to institutional giving and event management, everything happens in one seamless, beautifully animated interface.

---

## ✨ Key Features

### 👨‍🎓 Students
- **Networking & Mentorship** — Connect directly with alumni for career guidance
- **Job & Internship Board** — Browse opportunities posted by alumni and curated by admins
- **Success Feed** — Get inspired by real alumni milestones and career stories
- **Events** — Stay updated on upcoming workshops, seminars, and networking events

### 🎓 Alumni
- **Donations** — Make secure contributions with automated, downloadable PDF receipts
- **Share Success** — Post career milestones to a dynamic vertical feed that inspires students
- **Job Posting** — Share exclusive job and internship openings with the student community

### 👨‍🏫 Faculty
- **Event Management** — View departmental events, RSVP, and receive unique QR code tickets
- **Student Support** — Engage with the community and track alumni progress
- **Helpdesk** — Dedicated support channel for academic and administrative queries

### 🛡️ Administrators
- **Analytics Dashboard** — High-level overview of platform activity and metrics
- **User Management** — Review, approve, and manage registrations for all roles
- **Content Moderation** — Approve job postings and success stories before they go live
- **Donation Tracking** — Monitor institutional giving campaigns in real time
- **Announcements** — Broadcast institution-wide or role-specific messages

---

## 🌟 What Makes It Unique

| Feature | Description |
|---|---|
| **4-Way Ecosystem** | Unlike traditional portals, this platform actively integrates Faculty and Students alongside Alumni and Admins |
| **Instant PDF Receipts** | Automated donation receipts generated on the fly using `html2canvas` + `jsPDF` |
| **Real-Time Sync** | Firebase Firestore ensures all updates (approvals, announcements, jobs) reflect instantly across clients |
| **Modern UI/UX** | Built with Tailwind CSS and Framer Motion for a premium, animated, responsive experience |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Auth & Database** | Firebase Authentication, Firestore |
| **File Storage** | Firebase Storage |
| **Data Visualization** | Recharts |
| **Maps** | Leaflet |
| **PDF Generation** | html2canvas, jsPDF |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) `v18` or higher
- `npm` or `yarn`
- A [Firebase](https://firebase.google.com/) project with the following services enabled:
  - **Authentication**
  - **Firestore Database**
  - **Storage**

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/nidhi808/Centralized-Alumni-Management-System.git
cd Centralized-Alumni-Management-System
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the root directory (alongside `package.json`) and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> ⚠️ **Important:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

**4. Start the development server**

```bash
npm run dev
```

**5. Open in browser**

Navigate to the local URL shown in your terminal (typically `http://localhost:5173`).

---

## 📁 Project Structure

```
Centralized-Alumni-Management-System/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, icons, and media
│   ├── components/          # Reusable UI components
│   ├── pages/               # Role-based page views
│   │   ├── admin/           # Admin dashboard & management
│   │   ├── alumni/          # Alumni portal
│   │   ├── faculty/         # Faculty portal
│   │   └── student/         # Student portal
│   ├── firebase/            # Firebase config & service utilities
│   ├── context/             # React context (auth, roles, etc.)
│   ├── hooks/               # Custom React hooks
│   └── main.jsx             # App entry point
├── .env                     # Environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 👥 User Roles

The system is built on a **Role-Based Access Control (RBAC)** model with four distinct roles:

```
┌─────────────────────────────────────────────────────────┐
│                     Platform Users                      │
├──────────┬──────────────┬──────────┬────────────────────┤
│  Admin   │    Alumni    │ Faculty  │      Student       │
│          │              │          │                    │
│ Full     │ Donate       │ Events   │ Browse Jobs        │
│ Control  │ Post Jobs    │ RSVP     │ Connect w/ Alumni  │
│          │ Share Stories│ Helpdesk │ View Feed          │
└──────────┴──────────────┴──────────┴────────────────────┘
```

Upon registration or login, users are automatically routed to their personalized dashboards based on their assigned role.

---

## 🧪 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure your code follows the existing style and that all components are responsive.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

For questions, issues, or feature requests, please open an [issue](https://github.com/nidhi808/Centralized-Alumni-Management-System/issues) on GitHub.

---

<div align="center">
  Made with ❤️ for institutions that believe in the power of community.
</div>
