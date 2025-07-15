
import React, { useState, useEffect } from 'react';
import pako from 'pako';
import type { Trip, ItineraryItem, DayPlan } from './types';
import Header from './components/common/Header';
import TripView from './components/TripView';
import ItineraryView from './components/ItineraryView';
import { generateColor } from './utils';


const decompressTripFromUrl = (encodedData: string): Trip => {
    let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    const compressedString = atob(base64);
    const compressed = new Uint8Array(compressedString.length).map((_, i) => compressedString.charCodeAt(i));
    const jsonString = pako.inflate(compressed, { to: 'string' });
    return JSON.parse(jsonString);
};

const App: React.FC = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
    const [sharedTripData, setSharedTripData] = useState<Trip | null>(null);

    useEffect(() => {
        try {
            const storedTripsJson = localStorage.getItem('travel_planner_trips');
            if (storedTripsJson) {
                const storedTrips = JSON.parse(storedTripsJson);
                const migratedTrips = storedTrips.map((trip: any): Trip => {
                    const needsMigration = 'coverImageUrl' in trip || !trip.color || !('memo' in trip);
                     if (needsMigration) {
                        const { coverImageUrl, ...rest } = trip;
                        return {
                            ...rest,
                            color: trip.color || generateColor(trip.id),
                            memo: trip.memo || '',
                        };
                    }
                    return trip;
                });
                setTrips(migratedTrips);
            }
        } catch (error) {
            console.error("Failed to load trips from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('travel_planner_trips', JSON.stringify(trips));
        } catch (error) {
            console.error("Failed to save trips to localStorage", error);
        }
    }, [trips]);
    
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#/share/')) {
                const encodedData = hash.substring('#/share/'.length);
                try {
                    const trip = decompressTripFromUrl(encodedData);
                    setSharedTripData(trip);
                    setSelectedTripId(null); // Ensure we are in share view mode
                } catch (error) {
                    console.error("Failed to decode shared trip:", error);
                    alert("無効な共有リンクです。");
                    window.location.hash = '';
                }
            } else {
                setSharedTripData(null);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial check on load

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const addTrip = (trip: Trip) => {
        setTrips(prevTrips => [...prevTrips, trip]);
    };

    const deleteTrip = (tripId: string) => {
        setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
        if (selectedTripId === tripId) {
            setSelectedTripId(null);
        }
    };
    
    const updateTrip = (updatedTrip: Trip) => {
        setTrips(prevTrips => prevTrips.map(trip => trip.id === updatedTrip.id ? updatedTrip : trip));
    };

    const selectedTrip = trips.find(trip => trip.id === selectedTripId);

    const renderContent = () => {
        if (sharedTripData) {
            return (
                <ItineraryView
                    trip={sharedTripData}
                    onBack={() => (window.location.hash = '')}
                    onUpdateTrip={() => {}} // No-op for read-only
                    isReadOnly={true}
                />
            );
        }
        if (selectedTrip) {
            return (
                <ItineraryView 
                    trip={selectedTrip} 
                    onBack={() => setSelectedTripId(null)} 
                    onUpdateTrip={updateTrip}
                />
            );
        }
        return (
            <TripView 
                trips={trips} 
                onAddTrip={addTrip} 
                onSelectTrip={setSelectedTripId}
                onDeleteTrip={deleteTrip}
            />
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;