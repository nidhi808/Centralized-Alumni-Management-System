import { useState, useEffect } from 'react';
import { FaLinkedinIn } from 'react-icons/fa';
import { FiAward } from 'react-icons/fi';
import { getTopAlumni } from '../services/firestore';

export default function TopAlumni() {
    const [topAlumni, setTopAlumni] = useState([]);

    useEffect(() => {
        getTopAlumni().then(data => setTopAlumni(data));
    }, []);

    return (
        <section id="alumni" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-3">
                    <FiAward size={16} />
                    Featured Achievers
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-text dark:text-white tracking-tight">
                    Our Top Alumni
                </h2>
                <p className="mt-2 text-text-muted dark:text-gray-400 max-w-xl mx-auto">
                    Celebrating the outstanding graduates who are shaping industries and making a global impact.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topAlumni.map((person) => (
                    <div
                        key={person.id}
                        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700 hover:border-primary/20 dark:hover:border-blue-500/30 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Gradient top strip */}
                        <div className="h-24 bg-gradient-to-br from-primary via-primary-light to-accent/70 relative">
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                                <img
                                    src={person.photo}
                                    alt={person.name}
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="pt-14 pb-5 px-5 text-center">
                            <h3 className="text-lg font-bold text-text dark:text-white">{person.name}</h3>
                            <p className="text-xs text-text-muted dark:text-gray-500 mt-0.5">Class of {person.graduationYear}</p>
                            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-surface dark:bg-gray-700 text-xs font-medium text-text-muted dark:text-gray-300">
                                {person.position}
                            </div>
                            <p className="text-sm font-semibold text-primary dark:text-blue-400 mt-1">{person.company}</p>

                            <a
                                href={person.linkedIn}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary dark:text-blue-400 bg-primary/5 dark:bg-blue-500/10 hover:bg-primary hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300"
                            >
                                <FaLinkedinIn size={14} />
                                Connect
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
