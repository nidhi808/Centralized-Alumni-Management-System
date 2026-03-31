import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { FaQuestionCircle } from 'react-icons/fa';

const faqData = [
    {
        question: 'How do I update my alumni profile?',
        answer:
            'Log in to your alumni account, navigate to "My Profile" from the dashboard menu, and click "Edit Profile." You can update your contact information, employment details, and profile picture.',
    },
    {
        question: 'How can I connect with other alumni?',
        answer:
            'Use the Alumni Directory to search by name, graduation year, or location. You can also join our LinkedIn group or attend alumni networking events listed in the Events section.',
    },
    {
        question: 'What benefits do alumni members receive?',
        answer:
            'Alumni enjoy lifetime library access, career center resources, exclusive event invitations, mentorship opportunities, campus facility discounts, and access to our global professional network.',
    },
    {
        question: 'How do I register for alumni events?',
        answer:
            'Visit the Events page, select the event you\'re interested in, and click "Register." You\'ll receive a confirmation email with event details, parking info, and any required materials.',
    },
    {
        question: 'Can I contribute to the scholarship fund?',
        answer:
            'Absolutely! Visit the Donate section or contact the Alumni Office directly. All donations are tax-deductible and go toward supporting current students through merit-based and need-based scholarships.',
    },
    {
        question: 'How do I get my alumni ID card?',
        answer:
            'Request a digital alumni ID through your dashboard after logging in. For a physical card, visit the Alumni Office on campus or submit a request form online. Cards are typically mailed within 2 weeks.',
    },
    {
        question: 'Is there a mobile app for alumni?',
        answer:
            'Yes! Our AlumniConnect mobile app is available on both iOS and Android. It provides event notifications, directory access, news updates, and direct messaging with fellow graduates.',
    },
    {
        question: 'How do I volunteer for the mentorship program?',
        answer:
            'Navigate to the Mentorship section from your dashboard, fill in your areas of expertise and availability, and our team will match you with current students. Training materials are provided after registration.',
    },
];

function FAQItem({ item, isOpen, onClick }) {
    return (
        <div
            className={`border rounded-xl transition-all duration-300 ${isOpen
                    ? 'border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
        >
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
            >
                <span
                    className={`text-sm font-semibold transition-colors ${isOpen ? 'text-primary dark:text-blue-400' : 'text-text dark:text-gray-200'
                        }`}
                >
                    {item.question}
                </span>
                <FiChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary dark:text-blue-400' : 'text-text-muted dark:text-gray-400'
                        }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <p className="px-6 pb-4 text-sm text-text-muted dark:text-gray-400 leading-relaxed">
                    {item.answer}
                </p>
            </div>
        </div>
    );
}

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-3">
                    <FaQuestionCircle size={14} />
                    Help Center
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-text dark:text-white tracking-tight">
                    Frequently Asked Questions
                </h2>
                <p className="mt-2 text-text-muted dark:text-gray-400 max-w-xl mx-auto">
                    Find answers to common questions about our alumni community and services.
                </p>
            </div>

            {/* FAQ Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                {faqData.map((item, i) => (
                    <FAQItem
                        key={i}
                        item={item}
                        isOpen={openIndex === i}
                        onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                    />
                ))}
            </div>
        </section>
    );
}
