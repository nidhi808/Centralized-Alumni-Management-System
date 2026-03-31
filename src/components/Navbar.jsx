import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Alumni', href: '#alumni' },
    { label: 'Map', href: '#map' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#footer' },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <a href="#home" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
                            <FaGraduationCap className="text-white text-2xl" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-xl font-extrabold text-primary dark:text-white tracking-tight leading-none mb-[3px]">
                                AlumniConnect
                            </span>
                            <span className="text-[11px] text-primary/70 dark:text-blue-400/80 font-bold tracking-[0.2em] uppercase leading-none">
                                University Portal
                            </span>
                        </div>
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-primary/5 dark:hover:bg-blue-500/10 transition-all duration-200"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="ml-2">
                            <ThemeToggle />
                        </div>
                        <Link
                            to="/login"
                            className="ml-3 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setOpen(!open)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            {open ? <FiX size={22} /> : <FiMenu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-4 py-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-primary/5 dark:hover:bg-blue-500/10 transition-all"
                        >
                            {link.label}
                        </a>
                    ))}
                    <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="block text-center mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </nav>
    );
}
