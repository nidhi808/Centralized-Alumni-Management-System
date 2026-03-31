import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { useToast } from '../../components/ui/Toast';
import { getFacultyProfile, updateFacultyProfile } from '../../services/facultyService';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  FaUser, FaSpinner, FaSave, FaGraduationCap,
  FaFlask, FaAward, FaLinkedin, FaGlobe, FaCamera, FaCloudUploadAlt
} from 'react-icons/fa';

export default function FacultyProfile() {
  const { currentUser, updateDisplayName } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file (JPG, PNG, etc.)', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5MB', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `profilePhotos/${currentUser.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        addToast('Upload failed. Check Firebase Storage rules.', 'error');
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          // Save URL to Firestore
          await updateFacultyProfile(currentUser.uid, { photoURL: downloadURL });
          setProfile(prev => ({ ...prev, photoURL: downloadURL }));
          addToast('Profile photo updated! 📸', 'success');
        } catch (err) {
          console.error(err);
          addToast('Failed to save photo URL', 'error');
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    );
  };

  const [profile, setProfile] = useState({
    name: '',
    designation: '',
    department: 'Computer Science',
    researchAreas: '',
    bio: '',
    qualifications: '',
    linkedin: '',
    website: '',
    phone: '',
    photoURL: '',
  });

  useEffect(() => {
    if (!currentUser?.uid) return;
    (async () => {
      const data = await getFacultyProfile(currentUser.uid);
      if (data) {
        setProfile(prev => ({
          ...prev,
          name: data.name || currentUser?.displayName || data.email?.split('@')[0] || '',
          designation: data.designation || '',
          department: data.dept || 'Computer Science',
          researchAreas: data.researchAreas || '',
          bio: data.bio || '',
          qualifications: data.qualifications || '',
          linkedin: data.linkedin || '',
          website: data.website || '',
          phone: data.phone || '',
          photoURL: data.photoURL || '',
        }));
      }
      setLoading(false);
    })();
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile.name && profile.name !== currentUser?.displayName) {
        await updateDisplayName(profile.name);
      }
      await updateFacultyProfile(currentUser.uid, {
        name: profile.name,
        designation: profile.designation,
        dept: profile.department,
        researchAreas: profile.researchAreas,
        bio: profile.bio,
        qualifications: profile.qualifications,
        linkedin: profile.linkedin,
        website: profile.website,
        phone: profile.phone,
      });
      addToast('Profile updated successfully! ✅', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save profile. Check Firestore rules.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <FacultyLayout>
        <div className="flex items-center justify-center p-20">
          <FaSpinner className="animate-spin text-3xl text-[#086490]" />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-[#042a4a] via-[#086490] to-[#0a8fd4] rounded-2xl p-8 text-white relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="relative group">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl font-bold overflow-hidden">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile.name?.charAt(0).toUpperCase() || 'F'
                )}
              </div>
              {/* Upload overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <>
                    <FaCloudUploadAlt className="text-white text-lg animate-bounce" />
                    <span className="text-white text-[10px] font-bold mt-1">{uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <FaCamera className="text-white text-lg" />
                    <span className="text-white text-[10px] font-semibold mt-1">Change</span>
                  </>
                )}
              </button>
              {/* Progress ring */}
              {uploading && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#086490] border-2 border-white flex items-center justify-center">
                  <FaSpinner className="text-white text-xs animate-spin" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold capitalize">{profile.name || 'Faculty Member'}</h1>
              <p className="text-blue-200 text-sm mt-1">{profile.designation || 'Professor'}</p>
              <p className="text-blue-300/60 text-xs mt-1">{profile.department} • Xavier Institute of Engineering</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <FaUser className="text-[#086490]" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Designation</label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile(prev => ({ ...prev, designation: e.target.value }))}
                  placeholder="e.g., Associate Professor"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
                />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <FaFlask className="text-[#086490]" /> Academic Profile
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Research Areas</label>
                <input
                  type="text"
                  value={profile.researchAreas}
                  onChange={(e) => setProfile(prev => ({ ...prev, researchAreas: e.target.value }))}
                  placeholder="e.g., Machine Learning, NLP, Computer Vision"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Qualifications</label>
                <input
                  type="text"
                  value={profile.qualifications}
                  onChange={(e) => setProfile(prev => ({ ...prev, qualifications: e.target.value }))}
                  placeholder="e.g., Ph.D. (IIT Bombay), M.Tech (IIT Madras)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Academic Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="Write about your academic journey, research impact, and teaching philosophy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <FaGlobe className="text-[#086490]" /> Online Presence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <FaLinkedin className="text-blue-600" /> LinkedIn
                </label>
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <FaGlobe className="text-emerald-500" /> Website
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#086490]"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#086490] hover:bg-[#065478] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#086490]/25 transition-all disabled:opacity-50 hover:-translate-y-0.5"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </FacultyLayout>
  );
}
