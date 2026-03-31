import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FiMapPin, FiBriefcase } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { getAlumniLocations } from '../services/firestore';

const customMarkerIcon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="relative flex items-center justify-center w-8 h-8">
             <div class="absolute inset-0 bg-accent rounded-full animate-ping opacity-75"></div>
             <div class="relative w-4 h-4 bg-accent rounded-full border-2 border-white shadow"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

export default function AlumniMap() {
    const { dark } = useTheme();
    const [alumniLocations, setAlumniLocations] = useState([]);

    useEffect(() => {
        getAlumniLocations().then(data => setAlumniLocations(data));
    }, []);

    const tileUrl = dark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    return (
        <section id="map" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:text-blue-400 text-sm font-semibold mb-3">
                    <FiMapPin size={16} />
                    Global Network
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-text dark:text-white tracking-tight">
                    Alumni Around the World
                </h2>
                <p className="mt-2 text-text-muted dark:text-gray-400 max-w-xl mx-auto">
                    Our graduates are making an impact in every corner of the globe.
                </p>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
                <div className="rounded-xl overflow-hidden">
                    <MapContainer
                        center={[25, 10]}
                        zoom={2}
                        scrollWheelZoom={false}
                        style={{ height: '500px', width: '100%' }}
                        className="z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                            url={tileUrl}
                        />
                        {alumniLocations.map((loc) => (
                            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customMarkerIcon}>
                                <Popup className="modern-popup">
                                    <div className="min-w-[200px] p-1">
                                        <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                {loc.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 leading-tight m-0">{loc.name}</h4>
                                                <span className="inline-flex items-center mt-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase tracking-wide">
                                                    Alumni
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            <p className="flex items-center text-sm text-gray-700 m-0">
                                                <FiBriefcase className="mr-2 text-gray-400 shrink-0" />
                                                <span className="truncate">{loc.position}</span>
                                            </p>
                                            <p className="flex items-center text-sm text-gray-700 m-0">
                                                <FiMapPin className="mr-2 text-gray-400 shrink-0" />
                                                {loc.city}
                                            </p>
                                        </div>
                                        <button className="w-full py-2 bg-gray-50 hover:bg-primary hover:text-white text-primary font-semibold rounded-lg text-sm transition-colors border border-gray-200">
                                            View Profile
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            <style>{`
                .modern-popup .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 16px;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                }
                .modern-popup .leaflet-popup-content {
                    margin: 12px;
                }
                .custom-leaflet-marker {
                    background: transparent;
                    border: none;
                }
            `}</style>
        </section>
    );
}
