import { useState } from 'react';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { useToast } from '../../components/ui/Toast';
import {
  FaCog, FaBell, FaShieldAlt, FaEye, FaPalette,
  FaEnvelope, FaCalendarAlt, FaBriefcase, FaUserGraduate
} from 'react-icons/fa';

export default function FacultySettings() {
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState({
    emailNewAlumni: true,
    emailEventUpdates: true,
    emailJobApproval: false,
    emailChatMessages: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showContact: false,
    showResearch: true,
  });

  const handleToggle = (category, key) => {
    if (category === 'notifications') {
      setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    } else {
      setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    }
    addToast('Setting updated', 'info');
  };

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#086490]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        ${enabled ? 'bg-[#086490]' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm
        ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <FacultyLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FaCog className="text-[#086490]" /> Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your notification preferences and privacy controls.
          </p>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <FaBell className="text-[#086490]" /> Email Notifications
          </h3>
          <div className="space-y-4">
            {[
              { key: 'emailNewAlumni', label: 'New Alumni Registrations', desc: 'Get notified when a new alumnus joins your department.', icon: FaUserGraduate },
              { key: 'emailEventUpdates', label: 'Event Updates', desc: 'Receive updates about event registrations and RSVPs.', icon: FaCalendarAlt },
              { key: 'emailJobApproval', label: 'Job Approval Notifications', desc: 'Get notified when admin approves/rejects your job posts.', icon: FaBriefcase },
              { key: 'emailChatMessages', label: 'Chat Messages', desc: 'Email notifications for new chat messages.', icon: FaEnvelope },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#086490]/10 flex items-center justify-center text-[#086490] mt-0.5">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={notifications[item.key]}
                  onToggle={() => handleToggle('notifications', item.key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <FaShieldAlt className="text-[#086490]" /> Privacy Controls
          </h3>
          <div className="space-y-4">
            {[
              { key: 'showProfile', label: 'Public Profile', desc: 'Allow alumni and students to view your profile.', icon: FaEye },
              { key: 'showContact', label: 'Show Contact Info', desc: 'Display your phone number and email on your profile.', icon: FaEnvelope },
              { key: 'showResearch', label: 'Research Visibility', desc: 'Show your research areas publicly to facilitate collaboration.', icon: FaPalette },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#086490]/10 flex items-center justify-center text-[#086490] mt-0.5">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={privacy[item.key]}
                  onToggle={() => handleToggle('privacy', item.key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200 dark:border-red-500/20 p-6">
          <h3 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3">Danger Zone</h3>
          <p className="text-xs text-red-600 dark:text-red-300/70 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <button className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 dark:border-red-500/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </FacultyLayout>
  );
}
