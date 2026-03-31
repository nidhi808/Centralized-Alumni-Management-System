import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserEdit, FaCamera, FaLinkedin, FaGithub, FaGlobe, FaBriefcase, FaGraduationCap, FaSave, FaSpinner } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { getFacultyProfile, updateFacultyProfile } from '../../services/facultyService';

export default function AlumniProfile() {
  const { currentUser, updateDisplayName } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState('https://i.pravatar.cc/150?u=55');
  const [coverImage, setCoverImage] = useState(null);

  const [profileData, setProfileData] = useState({
    name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Alumni Member',
    role: 'Senior Software Engineer',
    company: 'Tech Innovators Inc.',
    location: 'Bangalore, India',
    batch: '2016',
    department: 'Computer Engineering',
    experience: '5 years',
    bio: 'Passionate about building scalable systems and mentoring the next generation of engineers. Always open to discussing system architecture or career growth.',
    linkedin: '',
    github: '',
    website: '',
    skills: ['React', 'Node.js', 'System Design', 'Cloud Architecture', 'Mentorship'],
    achievements: ['Employee of the Year 2023', 'Published 3 research papers on AI']
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.uid) {
        const data = await getFacultyProfile(currentUser.uid);
        if (data) {
          setProfileData(prev => ({ ...prev, ...data }));
          if (data.image) setProfileImage(data.image);
        }
      }
    };
    loadProfile();
  }, [currentUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profileData.name && profileData.name !== currentUser?.displayName) {
        await updateDisplayName(profileData.name);
      }
      await updateFacultyProfile(currentUser.uid, profileData);
      setIsEditing(false);
      addToast("Profile updated successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (e, field, index) => {
    const newArray = [...profileData[field]];
    newArray[index] = e.target.value;
    setProfileData({ ...profileData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setProfileData({ ...profileData, [field]: [...(profileData[field] || []), ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...profileData[field]].filter((_, i) => i !== index);
    setProfileData({ ...profileData, [field]: newArray });
  };

  const onCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(URL.createObjectURL(file));
    }
  };

  const onProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
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
    <DashboardLayout role="alumni">
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        
        {/* Hidden File Inputs */}
        <input type="file" ref={coverInputRef} onChange={onCoverImageChange} className="hidden" accept="image/*" />
        <input type="file" ref={profileInputRef} onChange={onProfileImageChange} className="hidden" accept="image/*" />

        {/* Profile Header Card */}
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show"
          className="glow-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden relative"
        >
          {/* Cover Photo */}
          <div 
            className="h-48 w-full bg-gradient-to-r from-primary to-accent relative overflow-hidden"
            style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
             {/* Abstract pattern */}
             {!coverImage && (
               <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="2" fill="currentColor"></circle>
                    </pattern>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
                  </svg>
               </div>
             )}
             {isEditing && (
               <button 
                 onClick={() => coverInputRef.current?.click()}
                 className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 text-sm font-semibold transition-colors"
               >
                 <FaCamera /> Change Cover
               </button>
             )}
          </div>

          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              <div className="relative group">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 object-cover shadow-xl bg-white"
                />
                {isEditing && (
                  <button 
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaCamera size={24} />
                  </button>
                )}
              </div>
              
              <div className="mb-2">
                {isEditing ? (
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-colors disabled:opacity-70"
                  >
                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    Save Changes
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary/20 dark:hover:bg-primary/30 dark:text-primary-light px-6 py-2.5 rounded-xl font-bold transition-colors"
                  >
                    <FaUserEdit />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2 space-y-6">
                {/* Basic Info */}
                <div>
                  {isEditing ? (
                    <input 
                      name="name" value={profileData.name} onChange={handleChange}
                      className="text-3xl font-extrabold text-text dark:text-white bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 w-full mb-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <h1 className="text-3xl font-extrabold text-text dark:text-white mb-1">{profileData.name}</h1>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-text-muted mt-2">
                    <span className="flex items-center gap-2"><FaBriefcase /> {isEditing ? <input name="role" value={profileData.role || ''} onChange={handleChange} className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary outline-none" placeholder="Role" /> : profileData.role}</span>
                    <span>at</span>
                    <span className="font-semibold text-text dark:text-gray-300">{isEditing ? <input name="company" value={profileData.company || ''} onChange={handleChange} className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary outline-none" placeholder="Company" /> : profileData.company}</span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="flex items-center gap-2 font-medium">{isEditing ? <input name="experience" value={profileData.experience || ''} onChange={handleChange} className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary outline-none w-20" placeholder="5 years" /> : (profileData.experience || 'Experience not set')}</span>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-bold text-text dark:text-white mb-3">About</h3>
                  {isEditing ? (
                    <textarea 
                      name="bio" value={profileData.bio} onChange={handleChange} rows="4"
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary text-text dark:text-gray-300 resize-none"
                    />
                  ) : (
                    <p className="text-text-muted leading-relaxed max-w-2xl">{profileData.bio}</p>
                  )}
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-6">
                 <div>
                   <h4 className="font-bold text-text dark:text-white mb-3 flex items-center gap-2"><FaGraduationCap className="text-primary"/> Education</h4>
                   <div className="space-y-2 text-sm text-text-muted">
                     <p><span className="font-semibold">Batch:</span> Class of {profileData.batch}</p>
                     <p><span className="font-semibold">Dept:</span> {profileData.department}</p>
                   </div>
                 </div>

                 <div>
                   <h4 className="font-bold text-text dark:text-white mb-3 text-sm tracking-wider uppercase">Social Links</h4>
                   <div className="space-y-3">
                     <a href={profileData.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-text-muted hover:text-blue-600 transition-colors">
                       <FaLinkedin size={20} /> <span className="text-sm truncate">LinkedIn</span>
                     </a>
                     <a href={profileData.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-text-muted hover:text-gray-900 dark:hover:text-white transition-colors">
                       <FaGithub size={20} /> <span className="text-sm truncate">GitHub</span>
                     </a>
                     <a href={profileData.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-text-muted hover:text-emerald-500 transition-colors">
                       <FaGlobe size={20} /> <span className="text-sm truncate">Portfolio Site</span>
                     </a>
                   </div>
                 </div>
                 
                 {/* Skills Section */}
                 <div>
                   <h4 className="font-bold text-text dark:text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-4 bg-primary rounded-full"></div> Skills</h4>
                   {isEditing ? (
                     <div className="space-y-2">
                       {(profileData.skills || []).map((skill, index) => (
                         <div key={index} className="flex gap-2">
                           <input 
                             value={skill} 
                             onChange={(e) => handleArrayChange(e, 'skills', index)}
                             className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
                             placeholder="E.g., React, Project Management"
                           />
                           <button onClick={() => removeArrayItem('skills', index)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">—</button>
                         </div>
                       ))}
                       <button onClick={() => addArrayItem('skills')} className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">+ Add Skill</button>
                     </div>
                   ) : (
                     <div className="flex flex-wrap gap-2">
                       {(profileData.skills || []).map((skill, index) => skill && (
                         <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700">
                           {skill}
                         </span>
                       ))}
                       {(!profileData.skills || profileData.skills.filter(s => s).length === 0) && <span className="text-sm text-gray-400">No skills added yet.</span>}
                     </div>
                   )}
                 </div>

                 {/* Achievements Section */}
                 <div>
                   <h4 className="font-bold text-text dark:text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-4 bg-amber-400 rounded-full"></div> Achievements</h4>
                   {isEditing ? (
                     <div className="space-y-2">
                       {(profileData.achievements || []).map((ach, index) => (
                         <div key={index} className="flex gap-2">
                           <input 
                             value={ach} 
                             onChange={(e) => handleArrayChange(e, 'achievements', index)}
                             className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-amber-400"
                             placeholder="E.g., Promoted to Tech Lead"
                           />
                           <button onClick={() => removeArrayItem('achievements', index)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">—</button>
                         </div>
                       ))}
                       <button onClick={() => addArrayItem('achievements')} className="text-xs font-bold text-amber-500 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors">+ Add Achievement</button>
                     </div>
                   ) : (
                     <ul className="space-y-2">
                       {(profileData.achievements || []).map((ach, index) => ach && (
                         <li key={index} className="text-sm text-text-muted flex items-start gap-2">
                           <span className="text-amber-400 mt-0.5">•</span> {ach}
                         </li>
                       ))}
                       {(!profileData.achievements || profileData.achievements.filter(a => a).length === 0) && <li className="text-sm text-gray-400">No achievements added yet.</li>}
                     </ul>
                   )}
                 </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Completion Widget */}
        <motion.div variants={item} className="glow-card bg-gradient-to-r from-primary to-accent rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
           {/* Subtle overlay */}
           <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
           
           <div className="relative z-10">
             <h3 className="text-2xl font-bold mb-2">Profile is 85% Complete</h3>
             <p className="text-blue-100 max-w-md text-sm leading-relaxed">
               Adding your detailed work history and specific technical skills helps the matchmaking algorithm pair you with the right mentees.
             </p>
           </div>
           
           <div className="relative z-10 w-full md:w-auto">
             <button 
               onClick={() => setIsEditing(true)}
               className="w-full md:w-auto bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
             >
               Complete Profile
             </button>
           </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
