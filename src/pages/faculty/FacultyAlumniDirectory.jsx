import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { useToast } from '../../components/ui/Toast';
import { subscribeToDeptAlumni, sendConnectionRequest, subscribeToConnections } from '../../services/facultyService';
import {
  FaSearch, FaUserGraduate, FaSpinner, FaEnvelope,
  FaBriefcase, FaLinkedin, FaUserPlus, FaCheckCircle
} from 'react-icons/fa';

export default function FacultyAlumniDirectory() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const dept = 'All';

  const [alumni, setAlumni] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub1 = subscribeToDeptAlumni(dept, (data) => {
      setAlumni(data);
      setLoading(false);
    });
    let unsub2 = () => {};
    if (currentUser?.uid) {
      unsub2 = subscribeToConnections(currentUser.uid, setConnections);
    }
    return () => { unsub1(); unsub2(); };
  }, [currentUser, dept]);

  const filteredAlumni = alumni.filter(a =>
    (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.company || '').toLowerCase().includes(search.toLowerCase())
  );

  const isConnected = (alumniId) =>
    connections.some(c => c.toId === alumniId);

  const handleConnect = async (alumniId) => {
    try {
      await sendConnectionRequest(currentUser.uid, alumniId);
      addToast('Connection request sent! 🤝', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to send connection request', 'error');
    }
  };

  return (
    <FacultyLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Alumni Directory</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse and connect with alumni from your department.
          </p>
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni..."
            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#086490] w-full sm:w-72"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <FaSpinner className="animate-spin text-3xl text-[#086490]" />
        </div>
      ) : filteredAlumni.length === 0 ? (
        <div className="text-center p-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <FaUserGraduate className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">
            {alumni.length === 0 ? 'No Alumni in Department' : 'No Results Found'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {alumni.length === 0
              ? 'Alumni will appear here once they register under your department.'
              : 'Try adjusting your search query.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alumni</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Position</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filteredAlumni.map((alumnus) => (
                  <tr key={alumnus.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#086490] to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {(alumnus.name || alumnus.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                            {alumnus.name || alumnus.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <FaEnvelope size={9} /> {alumnus.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBriefcase size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{alumnus.position || alumnus.company || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{alumnus.batch || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        alumnus.status === 'verified'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {alumnus.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {isConnected(alumnus.id) ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <FaCheckCircle size={12} /> Connected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConnect(alumnus.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#086490] hover:bg-[#086490]/10 rounded-lg transition-colors"
                          >
                            <FaUserPlus size={12} /> Connect
                          </button>
                        )}
                        <a
                          href={`/faculty/chat?with=${alumnus.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#086490] hover:bg-[#086490]/10 transition-colors"
                        >
                          <FaLinkedin size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </FacultyLayout>
  );
}
