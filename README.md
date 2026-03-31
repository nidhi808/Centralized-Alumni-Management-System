# Centralized Alumni Management System

The Centralized Alumni Management System is a comprehensive, modern web application designed to bridge the gap between an institution's students, faculty, alumni, and administrators. It provides a seamless, unified platform for networking, mentorship, career opportunities, event management, and institutional giving.

## 🚀 How It Works
The platform operates on a role-based access control (RBAC) system with four distinct user types: **Admin**, **Alumni**, **Faculty**, and **Student**. Upon registration or login, users are routed to their personalized dashboards where they can access features tailored specifically to their role. Real-time data synchronization is powered by Firebase, ensuring that announcements, job postings, and donations are instantly updated across the platform.

## ✨ Key Features

### 👨‍🎓 For Students
* **Networking & Mentorship:** Connect with alumni for career advice and guidance.
* **Job & Internship Board:** View and apply for job opportunities posted by alumni and approved by admins.
* **Success Feed:** Get inspired by reading success stories and achievements shared by alumni.
* **Events:** Stay updated on upcoming workshops, seminars, and networking events.

### 🎓 For Alumni
* **Give Back (Donations):** Easily make secure donations to the institution with real-time tracking and automated downloadable PDF receipts.
* **Share Success:** Post success stories and career milestones on the vertical success feed to inspire current students.
* **Job Posting:** Share exclusive job and internship opportunities with the student community.

### 👨‍🏫 For Faculty
* **Event Management:** View all departmental events, RSVP easily, and receive unique QR code tickets for entry.
* **Student Support:** Engage with the community and track alumni progress to assist current students.
* **Helpdesk:** Dedicated support channel for academic and administrative queries.

### 🛡️ For Administrators
* **Comprehensive Dashboard:** High-level analytics and overview of system activity.
* **User Management:** Review, approve, and manage registrations for all roles.
* **Job & Content Approval:** Ensure platform quality by reviewing and approving job postings and success stories before they go live.
* **Donation Tracking:** Monitor institutional giving and funding campaigns.
* **Announcement Broadcasting:** Publish institution-wide or role-specific announcements.

## 🌟 What Makes It Unique?
* **4-Way Interactive Ecosystem:** Unlike traditional portals that only connect alumni and admins, our platform actively integrates **Faculty** and **Students** into the daily workflow, creating a self-sustaining community ecosystem.
* **Streamlined Give-Back Loop:** Features automated, instant PDF receipts for donations, making institutional giving transparent and extremely easy.
* **Modern, Dynamic UI:** Built with Tailwind CSS and Framer Motion, offering a frictionless, premium, and highly responsive user experience with smooth micro-animations.
* **Instant Real-Time Updates:** Leveraging Firebase Firestore, actions like job approvals, new announcements, and profile updates reflect instantly across all connected clients without needing a page refresh.

## 🛠️ Tech Stack
* **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion (Animations)
* **Backend / Database:** Firebase (Authentication, Firestore, Storage)
* **Data Visualization & Utilities:** Recharts (Analytics), leaflet (Maps), html2canvas & jsPDF (Receipt Generation)

## 💻 How to Run Locally

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn
* A Firebase project with Firestore, Authentication, and Storage enabled.

### Installation Steps

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/nidhi808/Centralized-Alumni-Management-System.git
   cd Centralized-Alumni-Management-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory (alongside `package.json`) and add your Firebase configuration credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to the local URL provided by Vite (typically `http://localhost:5173`) to view the application.
