import { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AnnouncementPanel from './AnnouncementPanel';
import { getGalleryImages } from '../services/firestore';

export default function GallerySection() {
    const [galleryImages, setGalleryImages] = useState([]);
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    useEffect(() => {
        getGalleryImages().then(data => setGalleryImages(data));
    }, []);

    const total = galleryImages.length;

    const goTo = useCallback(
        (index) => {
            if (isTransitioning) return;
            setIsTransitioning(true);
            setCurrent((index + total) % total);
            setTimeout(() => setIsTransitioning(false), 600);
        },
        [isTransitioning, total]
    );

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    useEffect(() => {
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Carousel — spans 2 cols on lg */}
                <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-xl group bg-gray-900 aspect-[16/9] lg:aspect-auto lg:min-h-[420px]">
                    {total === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50">Loading gallery...</div>
                    ) : (
                        <>
                            {galleryImages.map((img, i) => (
                        <div
                            key={img.id}
                            className="absolute inset-0 transition-all duration-700 ease-in-out"
                            style={{
                                opacity: i === current ? 1 : 0,
                                transform: i === current ? 'scale(1)' : 'scale(1.08)',
                            }}
                        >
                            <img
                                src={img.url}
                                alt={img.caption}
                                className="w-full h-full object-cover"
                                loading={i === 0 ? 'eager' : 'lazy'}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                    ))}

                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                        <p className="text-white text-lg md:text-xl font-semibold drop-shadow-lg">
                            {galleryImages[current].caption}
                        </p>
                    </div>

                    {/* Arrows */}
                    <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40"
                    >
                        <FiChevronLeft size={20} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40"
                    >
                        <FiChevronRight size={20} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                        {galleryImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === current
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/50 hover:bg-white/75'
                                    }`}
                            />
                        ))}
                    </div>
                    </>
                )}
                </div>

                {/* Announcements */}
                <div className="lg:col-span-1">
                    <AnnouncementPanel />
                </div>
            </div>
        </section>
    );
}
