import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUserEdit, FaCamera, FaLinkedin, FaGithub, FaGlobe, FaGraduationCap, FaSave, FaSpinner } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export default function StudentProfile() {
  const { currentUser, updateDisplayName } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState('https://ui-avatars.com/api/?name=Student+User&background=086490&color=fff');
  const [coverImage, setCoverImage] = useState(null);

  const [profileData, setProfileData] = useState({
    name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student Member',
    status: 'XIE Student',
    location: 'Mumbai, India',
    batch: '2025',
    department: 'Computer Engineering',
    bio: 'Looking forward to connecting with alumni and learning about software engineering and possible mentorship opportunities.',
    linkedin: 'https://linkedin.com/in/student',
    github: 'https://github.com/student',
    website: 'https://myportfolio.com',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profileData.name && profileData.name !== currentUser?.displayName) {
        await updateDisplayName(profileData.name);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to update display name", "error");
    }
    // Simulate API call to save to Firestore
    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
      addToast("Profile updated successfully!", "success");
    }, 1500);
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const onCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setCoverImage(URL.createObjectURL(file));
  };

  const onProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        <input type="file" ref={coverInputRef} onChange={onCoverImageChange} className="hidden" accept="image/*" />
        <input type="file" ref={profileInputRef} onChange={onProfileImageChange} className="hidden" accept="image/*" />

        <motion.div variants={container} initial="hidden" animate="show" className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden relative">
          <div 
            className="h-48 w-full bg-gradient-to-r from-[#086490] to-blue-400 relative overflow-hidden"
            style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
             {!coverImage && (
               <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2" fill="currentColor"></circle></pattern>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
                  </svg>
               </div>
             )}
             {isEditing && (
               <button onClick={() => coverInputRef.current?.click()} className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 text-sm font-semibold transition-colors">
                 <FaCamera /> Change Cover
               </button>
             )}
          </div>

          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              <div className="relative group">
                <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 object-cover shadow-xl bg-white" />
                {isEditing && (
                  <button onClick={() => profileInputRef.current?.click()} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaCamera size={24} />
                  </button>
                )}
              </div>
              
              <div className="mb-2">
                {isEditing ? (
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#086490] hover:bg-[#065478] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-colors disabled:opacity-70">
                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Changes
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-[#086490]/10 hover:bg-[#086490]/20 text-[#086490] px-6 py-2.5 rounded-xl font-bold transition-colors">
                    <FaUserEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2 space-y-6">
                <div>
                  {isEditing ? (
                    <input name="name" value={profileData.name} onChange={handleChange} className="text-3xl font-extrabold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 w-full mb-2 outline-none focus:ring-2 focus:ring-[#086490]" />
                  ) : (
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{profileData.name}</h1>
                  )}
                  <p className="text-gray-500 font-medium">Student at Xavier Institute of Engineering</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About</h3>
                  {isEditing ? (
                    <textarea name="bio" value={profileData.bio} onChange={handleChange} rows="4" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#086490] text-gray-900 dark:text-gray-300 resize-none" />
                  ) : (
                    <p className="text-gray-500 leading-relaxed max-w-2xl">{profileData.bio}</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 justify-self-stretch self-start p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-6 w-full">
                 <div>
                   <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><FaGraduationCap className="text-[#086490]"/> Education</h4>
                   <div className="space-y-2 text-sm text-gray-500">
                     <p><span className="font-semibold text-gray-700 dark:text-gray-300">Expected Graduation:</span> {profileData.batch}</p>
                     <p><span className="font-semibold text-gray-700 dark:text-gray-300">Dept:</span> {profileData.department}</p>
                   </div>
                 </div>

                 <div>
                   <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm tracking-wider uppercase">Social Links</h4>
                   <div className="space-y-3">
                     <a href={profileData.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-500 hover:text-blue-600 transition-colors">
                       <FaLinkedin size={20} /> <span className="text-sm truncate">LinkedIn</span>
                     </a>
                     <a href={profileData.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                       <FaGithub size={20} /> <span className="text-sm truncate">GitHub</span>
                     </a>
                     <a href={profileData.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-500 hover:text-emerald-500 transition-colors">
                       <FaGlobe size={20} /> <span className="text-sm truncate">Portfolio Site</span>
                     </a>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
