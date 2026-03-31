import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaUserGraduate, FaChalkboardTeacher, FaUsers, FaUserShield } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';

export default function Register() {
    const [email, setEmail] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const location = useLocation();
    const forcedRole = location.state?.role;
    const [role, setRole] = useState(forcedRole || 'student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Creating Account...');
    const [idCardFile, setIdCardFile] = useState(null);

    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            setLoadingText('Authenticating...');
            
            let additionalData = {
                rollNumber: rollNumber || ''
            };
            
            if (role === 'student' && !idCardFile) {
                setLoading(false);
                return setError('College ID Card PDF is required for students');
            }

            // 1. Create the user in Auth & Firestore first
            const user = await signup(email, password, role, additionalData);

            // 2. Now that user is authenticated, we can upload to Firebase Storage
            if (role === 'student' && idCardFile) {
                setLoadingText('Uploading ID...');
                const fileRef = ref(storage, `id_cards/${user.uid}_${idCardFile.name}`);
                
                // Use resumable upload to track progress
                const uploadTask = uploadBytesResumable(fileRef, idCardFile);
                
                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                            setUploadProgress(progress);
                            setLoadingText(`Uploading ID... ${progress}%`);
                        },
                        (error) => {
                            reject(error);
                        },
                        async () => {
                            try {
                                const url = await getDownloadURL(uploadTask.snapshot.ref);
                                await updateDoc(doc(db, "users", user.uid), {
                                    idCardUrl: url
                                });
                                resolve();
                            } catch (err) {
                                reject(err);
                            }
                        }
                    );
                });
            }

            setLoadingText('Redirecting...');

            // Redirect based on role
            switch (role) {
                case 'student':
                    navigate('/student-dashboard');
                    break;
                case 'faculty':
                    navigate('/faculty-dashboard');
                    break;
                case 'alumni':
                    navigate('/alumni-dashboard');
                    break;
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-surface dark:bg-gray-950 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
                        <FaGraduationCap className="text-white text-lg" />
                    </div>
                    <span className="text-lg font-bold text-primary dark:text-white">AlumniConnect</span>
                </Link>
                <ThemeToggle />
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                    <h2 className="text-2xl font-bold text-center text-text dark:text-white mb-6">Create an Account</h2>

                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@university.edu"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-text dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">Institute Roll Number</label>
                                <input
                                    type="text"
                                    required
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    placeholder="e.g. 21BCE1023"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-text dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">Role</label>
                            {forcedRole ? (
                                <div className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-text-muted dark:text-gray-400 font-medium capitalize flex items-center gap-3">
                                    {role === 'admin' && <FaUserShield className="text-xl" />}
                                    {role === 'faculty' && <FaChalkboardTeacher className="text-xl" />}
                                    {role === 'student' && <FaUserGraduate className="text-xl" />}
                                    {role === 'alumni' && <FaUsers className="text-xl" />}
                                    {role}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRole('student')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === 'student' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <FaUserGraduate className="text-xl mb-1" />
                                        <span className="text-xs font-medium">Student</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('alumni')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === 'alumni' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <FaUsers className="text-xl mb-1" />
                                        <span className="text-xs font-medium">Alumni</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('faculty')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === 'faculty' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <FaChalkboardTeacher className="text-xl mb-1" />
                                        <span className="text-xs font-medium">Faculty</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {role === 'student' && (
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">Upload College ID Card (.pdf)</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    required
                                    onChange={(e) => setIdCardFile(e.target.files[0])}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-text dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-text dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text dark:text-gray-300 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-text dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !role}
                            className="w-full py-3 rounded-xl text-white font-semibold flex justify-center items-center bg-primary hover:bg-primary-dark shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {loadingText}
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-text-muted dark:text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
