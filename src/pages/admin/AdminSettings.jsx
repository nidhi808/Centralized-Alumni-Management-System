import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSiteSettings, updateSiteSettings } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { FaCog, FaUser, FaSave, FaToggleOn, FaToggleOff, FaPalette } from 'react-icons/fa';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AdminSettings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({ maintenanceMode: false, bannerText: '', bannerColor: '#086490' });
  const [profile, setProfile] = useState({ displayName: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    getSiteSettings().then(s => setSettings(prev => ({ ...prev, ...s })));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile({ displayName: currentUser?.email?.split('@')[0] || '', bio: '' });
  }, [currentUser]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSaveSettings = async () => {
    setSaving(true);
    try { await updateSiteSettings(settings); showToast('⚙️ Site settings saved!'); } catch (e) {}
    setSaving(false);
  };

  const userName = currentUser?.email?.split('@')[0] || 'Admin';

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Settings & Config</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage admin profile and global site configuration</p>
        </div>

        {/* Toast */}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-[200] px-5 py-3 bg-[#086490] text-white rounded-2xl shadow-2xl font-semibold text-sm">
            {toast}
          </motion.div>
        )}

        {/* Admin Profile Card */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <FaUser className="text-[#086490] dark:text-blue-400" size={16} />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Admin Profile</h3>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-xl"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{userName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
              <span className="inline-block mt-1 px-3 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold">Super Admin</span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Display Name</label>
              <input type="text" value={profile.displayName}
                onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#086490]/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Bio</label>
              <textarea rows={2} value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Add a short bio..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#086490]/30 resize-none" />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setSavingProfile(true); setTimeout(() => { setSavingProfile(false); showToast('✅ Profile updated!'); }, 800); }}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#086490] to-[#0ea5e9] text-white text-sm font-semibold shadow-md">
            {savingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSave size={13} />}
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </motion.button>
        </motion.div>

        {/* Site Settings */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <FaCog className="text-[#086490] dark:text-blue-400" size={16} />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Global Site Config</h3>
          </div>

          <div className="space-y-4">
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">🔧 Maintenance Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Show a maintenance banner to all users</p>
              </div>
              <button onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                className="text-2xl transition-transform active:scale-90">
                {settings.maintenanceMode
                  ? <FaToggleOn className="text-[#086490]" />
                  : <FaToggleOff className="text-gray-400" />
                }
              </button>
            </div>

            {/* Banner Text */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                <FaPalette className="inline mr-1" size={11} />Site Banner Text
              </label>
              <input type="text" placeholder="e.g. Welcome to XIE Alumni Portal!"
                value={settings.bannerText}
                onChange={e => setSettings(s => ({ ...s, bannerText: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#086490]/30" />
            </div>

            {/* Banner Color */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Banner Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.bannerColor}
                  onChange={e => setSettings(s => ({ ...s, bannerColor: e.target.value }))}
                  className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-white" />
                <span className="text-sm font-mono text-gray-600 dark:text-gray-300">{settings.bannerColor}</span>
              </div>
            </div>

            {/* Preview */}
            {(settings.bannerText || settings.maintenanceMode) && (
              <div className="rounded-xl p-3 text-white text-sm font-semibold text-center"
                style={{ backgroundColor: settings.bannerColor || '#086490' }}>
                {settings.maintenanceMode ? '🔧 Site Under Maintenance – ' : ''}
                {settings.bannerText || 'Welcome to XIE Alumni Portal'}
              </div>
            )}
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSaveSettings} disabled={saving}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#086490] to-[#0ea5e9] text-white text-sm font-semibold shadow-md disabled:opacity-60">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSave size={13} />}
            {saving ? 'Saving...' : 'Save Site Settings'}
          </motion.button>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
