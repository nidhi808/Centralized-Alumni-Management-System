import Navbar from '../components/Navbar';
import AnnouncementsTicker from '../components/AnnouncementsTicker';
import HeroSlider from '../components/HeroSlider';
import EventsGrid from '../components/EventsGrid';
import GallerySection from '../components/GallerySection';
import TopAlumni from '../components/TopAlumni';
import AlumniMap from '../components/AlumniMap';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function Home() {
    return (
        <div className="min-h-screen bg-surface dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <AnnouncementsTicker />
            <HeroSlider />
            <EventsGrid />
            <GallerySection />
            <TopAlumni />
            <AlumniMap />
            <FAQ />
            <Footer />
        </div>
    );
}
