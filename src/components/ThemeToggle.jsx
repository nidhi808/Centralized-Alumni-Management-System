import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
    const { dark, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
            <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center transition-transform duration-300 ${dark ? 'translate-x-7' : 'translate-x-0'
                    }`}
            >
                {dark ? (
                    <FiMoon size={13} className="text-yellow-400" />
                ) : (
                    <FiSun size={13} className="text-amber-500" />
                )}
            </span>
        </button>
    );
}
