/**
 * Firebase Seed Utility
 * 
 * Call seedFirestoreCollections() once to populate Firestore with sample data
 * for the Faculty Dashboard. Import this in any component and call it, 
 * or paste into the browser console.
 * 
 * Usage in a component:
 *   import { seedFirestoreCollections } from '../services/firebaseSeed';
 *   seedFirestoreCollections();
 */

import { db } from '../firebase';
import { collection, addDoc, setDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';

const DEPT = 'Computer Science';

const sampleAlumni = [
  { email: 'priya.sharma@alumni.edu', name: 'Priya Sharma', role: 'alumni', dept: DEPT, status: 'verified', batch: '2020', company: 'Google', position: 'Software Engineer', location: { lat: 37.77, lng: -122.41 }, city: 'San Francisco' },
  { email: 'rahul.kumar@alumni.edu', name: 'Rahul Kumar', role: 'alumni', dept: DEPT, status: 'verified', batch: '2019', company: 'Microsoft', position: 'Product Manager', location: { lat: 47.60, lng: -122.33 }, city: 'Seattle' },
  { email: 'anita.desai@alumni.edu', name: 'Anita Desai', role: 'alumni', dept: DEPT, status: 'pending', batch: '2021', company: 'Amazon', position: 'Data Scientist', location: { lat: 12.97, lng: 77.59 }, city: 'Bangalore' },
  { email: 'vikram.patel@alumni.edu', name: 'Vikram Patel', role: 'alumni', dept: DEPT, status: 'verified', batch: '2018', company: 'Tesla', position: 'ML Engineer', location: { lat: 37.39, lng: -122.08 }, city: 'Palo Alto' },
  { email: 'neha.singh@alumni.edu', name: 'Neha Singh', role: 'alumni', dept: DEPT, status: 'pending', batch: '2022', company: 'Adobe', position: 'UX Designer', location: { lat: 28.61, lng: 77.20 }, city: 'New Delhi' },
];

const sampleStudents = [
  { email: 'student1@xie.edu', name: 'Aditya Joshi', role: 'student', dept: DEPT, batch: '2025', status: 'active' },
  { email: 'student2@xie.edu', name: 'Sneha Patil', role: 'student', dept: DEPT, batch: '2025', status: 'active' },
  { email: 'student3@xie.edu', name: 'Rohan Mehta', role: 'student', dept: DEPT, batch: '2024', status: 'active' },
];

const sampleSuccessFeed = [
  { name: 'Priya Sharma', achievement: '🎉 Thrilled to share that our team just shipped a new AI-powered search feature! Grateful to Prof. faculty_test for the ML foundations during university.', company: 'Google', role: 'Software Engineer', dept: 'CS' },
  { name: 'Aditya Joshi', achievement: '🚀 Just secured a summer internship at Microsoft via the AlumniConnect platform! Special thanks to Alumnus Rahul Kumar for the referral.', company: 'Microsoft', role: 'Student Intern', dept: 'CS' },
  { name: 'Vikram Patel', achievement: '📢 Hosting a free webinar on "Self-Driving Cars & ML" next Saturday. Open to all students from our department!', company: 'Tesla', role: 'ML Engineer', dept: 'ME' },
];

const sampleEvents = [
  { title: 'AI Ethics in 2026 — Panel Discussion', description: 'A panel with industry leaders discussing responsible AI.', type: 'Webinar', date: '2026-04-10', location: 'Virtual (Zoom)', maxAttendees: 200, dept: DEPT, attendees: 45 },
  { title: 'React & Modern Frontend Workshop', description: 'Hands-on workshop on React 19, Vite, and Tailwind CSS.', type: 'Workshop', date: '2026-04-18', location: 'Lab 302, CS Building', maxAttendees: 50, dept: DEPT, attendees: 32 },
];

const sampleJobs = [
  { title: 'Software Engineer Intern', company: 'Google', type: 'Internship', location: 'Bangalore', salary: '₹80,000/month', description: 'Work on Search Infrastructure team.', dept: DEPT, status: 'approved' },
  { title: 'Data Analyst', company: 'Flipkart', type: 'Full-time', location: 'Mumbai', salary: '₹12 LPA', description: 'Analyze customer behavior patterns.', dept: DEPT, status: 'pending_admin_approval' },
];

const sampleAnnouncements = [
  { title: 'Department Placement Drive 2026', content: 'The annual placement drive begins on April 15th. All final-year students must register by April 10th.', type: 'urgent', targetAudience: 'department_alumni', dept: DEPT },
  { title: 'Alumni Mentorship Program — Registration Open', content: 'We are launching a 1-on-1 mentorship program between alumni and current students. Sign up on the dashboard.', type: 'general', targetAudience: 'department_alumni', dept: DEPT },
];

export async function seedFirestoreCollections(facultyUid) {
  console.log('🌱 Starting Firestore seed...');

  try {
    // 1. Seed Alumni users
    for (const alumni of sampleAlumni) {
      await addDoc(collection(db, 'users'), {
        ...alumni,
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Alumni seeded');

    // 2. Seed Students
    for (const student of sampleStudents) {
      await addDoc(collection(db, 'users'), {
        ...student,
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Students seeded');

    // 3. Seed Success Feed
    for (const item of sampleSuccessFeed) {
      await addDoc(collection(db, 'success_feed'), {
        ...item,
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Success Feed seeded');

    // 4. Seed Events
    for (const event of sampleEvents) {
      await addDoc(collection(db, 'events'), {
        ...event,
        authorId: facultyUid || 'faculty_seed',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Events seeded');

    // 5. Seed Jobs
    for (const job of sampleJobs) {
      await addDoc(collection(db, 'jobs'), {
        ...job,
        authorId: facultyUid || 'faculty_seed',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Jobs seeded');

    // 6. Seed Announcements
    for (const ann of sampleAnnouncements) {
      await addDoc(collection(db, 'announcements'), {
        ...ann,
        authorId: facultyUid || 'faculty_seed',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Announcements seeded');

    console.log('🎉 All Firestore collections seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}
