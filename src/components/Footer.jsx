import { FaGraduationCap, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Top Alumni', href: '#alumni' },
    { label: 'Alumni Map', href: '#map' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Donate', href: '#' },
];

const resources = [
    { label: 'Career Center', href: '#' },
    { label: 'Mentorship', href: '#' },
    { label: 'Scholarships', href: '#' },
    { label: 'Library Access', href: '#' },
    { label: 'Newsletter', href: '#' },
];

const socials = [
    { icon: FaFacebookF, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
];

export default function Footer() {
    return (
        <footer id="footer" className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Branding */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
                                <FaGraduationCap className="text-white text-lg" />
                            </div>
                            <span className="text-lg font-bold text-primary dark:text-white">AlumniConnect</span>
                        </div>
                        <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed">
                            Building a vibrant community of graduates, fostering connections, and empowering the next generation of leaders.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-2 mt-5">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 hover:border-primary/30 dark:hover:border-blue-500/30 hover:shadow-sm transition-all duration-200"
                                >
                                    <s.icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold text-text dark:text-white uppercase tracking-wider mb-4">Quick Links</h4>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-bold text-text dark:text-white uppercase tracking-wider mb-4">Resources</h4>
                        <ul className="space-y-2.5">
                            {resources.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-bold text-text dark:text-white uppercase tracking-wider mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-sm text-text-muted dark:text-gray-400">
                                <FiMapPin size={16} className="mt-0.5 shrink-0 text-primary dark:text-blue-400" />
                                123 University Avenue, Cambridge, MA 02139
                            </li>
                            <li className="flex items-center gap-2.5 text-sm text-text-muted dark:text-gray-400">
                                <FiMail size={16} className="shrink-0 text-primary dark:text-blue-400" />
                                <a href="mailto:alumni@university.edu" className="hover:text-primary dark:hover:text-blue-400 transition-colors">
                                    alumni@university.edu
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5 text-sm text-text-muted dark:text-gray-400">
                                <FiPhone size={16} className="shrink-0 text-primary dark:text-blue-400" />
                                +1 (617) 555-0192
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted dark:text-gray-500">
                    <span>&copy; {new Date().getFullYear()} AlumniConnect. All rights reserved.</span>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
