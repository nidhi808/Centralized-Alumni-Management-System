import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        title: 'Empowering the Global Alumni Network',
        subtitle: 'Connecting over 50,000+ graduates across 200+ chapters worldwide.',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        title: 'Mentorship & Career Growth',
        subtitle: 'Bridge the gap between students and experienced professionals.',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1511632765486-a01c80cb59c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        title: 'Giving Back to the Alma Mater',
        subtitle: 'Support the next generation of innovators and leaders.',
    },
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);

    const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
    const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

    useEffect(() => {
        const timer = setInterval(() => setCurrent(c => c === slides.length - 1 ? 0 : c + 1), 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[80vh] min-h-[600px] bg-gray-900 group">
            {/* Slides Container - This handles the image overflow clipping */}
            <div className="absolute inset-0 overflow-hidden">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        <div className="absolute inset-0 bg-black/50 z-10" />
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover scale-105 transform transition-transform duration-[10000ms] ease-linear"
                            style={{ transform: index === current ? 'scale(1.1)' : 'scale(1)' }}
                        />
                        <div className="absolute inset-0 z-20 flex items-center justify-center px-4 text-center">
                            <div className="max-w-4xl opacity-0 translate-y-8 animate-[fadeIn_1s_ease-out_forwards] animation-delay-300">
                                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                                    {slide.title}
                                </h1>
                                <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md">
                                    {slide.subtitle}
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <a href="/register" className="px-8 py-4 bg-accent hover:bg-accent-light text-white font-bold rounded-lg transition-colors shadow-lg shadow-accent/20">
                                        Join the Network
                                    </a>
                                    <a href="#impact" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 font-bold rounded-lg transition-all">
                                        Our Impact
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Impact Stats Overlay */}
            <div id="impact" className="absolute bottom-0 left-0 right-0 z-30 transform translate-y-1/2 hidden md:block">
                <div className="container mx-auto px-4">
                    <div className="bg-card dark:bg-gray-800 rounded-2xl shadow-xl flex justify-around p-8 border border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                            <h3 className="text-4xl font-extrabold text-primary dark:text-blue-400">50K+</h3>
                            <p className="text-text-muted dark:text-gray-400 font-medium mt-1">Global Alumni</p>
                        </div>
                        <div className="w-px bg-gray-200 dark:bg-gray-700" />
                        <div className="text-center">
                            <h3 className="text-4xl font-extrabold text-primary dark:text-blue-400">200+</h3>
                            <p className="text-text-muted dark:text-gray-400 font-medium mt-1">Active Chapters</p>
                        </div>
                        <div className="w-px bg-gray-200 dark:bg-gray-700" />
                        <div className="text-center">
                            <h3 className="text-4xl font-extrabold text-primary dark:text-blue-400">$10M+</h3>
                            <p className="text-text-muted dark:text-gray-400 font-medium mt-1">Funds Raised</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
                <FaChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
                <FaChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2 md:bottom-24">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition-all ${index === current ? 'bg-accent w-8' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                ))}
            </div>
        </div>
    );
}
