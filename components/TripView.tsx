
import React, { useState } from 'react';
import type { Trip, DayPlan } from '../types';
import { generateColor } from '../utils';
import { escapeHTML } from '../utils';
import { PlusIcon, CalendarIcon, MapPinIcon, TrashIcon } from './common/Icons';

interface TripViewProps {
    trips: Trip[];
    onAddTrip: (trip: Trip) => void;
    onSelectTrip: (tripId: string) => void;
    onDeleteTrip: (tripId: string) => void;
}

const CreateTripModal: React.FC<{ isOpen: boolean; onClose: () => void; onAddTrip: (trip: Trip) => void }> = ({ isOpen, onClose, onAddTrip }) => {
    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !destination || !startDate || !endDate) {
            setError('すべての項目を入力してください。');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError('終了日は開始日より後に設定してください。');
            return;
        }
        
        setError('');
        
        const getDates = (start: string, end: string) => {
            const dates = [];
            let currentDate = new Date(start);
            const stopDate = new Date(end);
            while (currentDate <= stopDate) {
                dates.push(new Date(currentDate).toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return dates;
        };

        const days: DayPlan[] = getDates(startDate, endDate).map(date => ({ date, items: [] }));
        const tripId = Date.now().toString();

        const newTrip: Trip = {
            id: tripId,
            title,
            destination,
            startDate,
            endDate,
            color: generateColor(tripId),
            days,
            memo: '',
        };
        onAddTrip(newTrip);
        onClose();
        // Reset form
        setTitle('');
        setDestination('');
        setStartDate('');
        setEndDate('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-slate-800">新しい旅を作成</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-600">旅のタイトル</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="例: 夏の沖縄旅行" />
                    </div>
                    <div>
                        <label htmlFor="destination" className="block text-sm font-medium text-slate-600">目的地</label>
                        <input type="text" id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="例: 沖縄県" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-slate-600">開始日</label>
                            <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                       <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-slate-600">終了日</label>
                            <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500">
                            キャンセル
                        </button>
                        <button type="submit" className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500">
                            作成
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TripCard: React.FC<{ trip: Trip; onSelect: () => void; onDelete: () => void; }> = ({ trip, onSelect, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(window.confirm(`「${trip.title}」を削除しますか？`)){
            onDelete();
        }
    };
    
    return (
        <div 
            className="group relative rounded-lg h-48 p-5 flex flex-col justify-end shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
            style={{ backgroundColor: trip.color }} 
            onClick={onSelect}
        >
             <div className="w-full">
                <h3 className="text-xl font-bold text-white truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">{escapeHTML(trip.title)}</h3>
                <div className="flex items-center text-sm text-slate-100 mt-2 space-x-4 [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                   <div className="flex items-center space-x-1.5">
                        <MapPinIcon className="h-4 w-4"/>
                        <span>{escapeHTML(trip.destination)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <CalendarIcon className="h-4 w-4"/>
                        <span>{trip.startDate.replace(/-/g, '/')} - {trip.endDate.replace(/-/g, '/')}</span>
                    </div>
                </div>
             </div>
             <button onClick={handleDelete} className="absolute top-2 right-2 p-1.5 bg-black/10 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/20 transition-opacity">
                <TrashIcon className="w-5 h-5" />
             </button>
        </div>
    );
};


const TripView: React.FC<TripViewProps> = ({ trips, onAddTrip, onSelectTrip, onDeleteTrip }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">旅の一覧</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    新しい旅を作成
                </button>
            </div>
            
            {trips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map(trip => (
                        <TripCard key={trip.id} trip={trip} onSelect={() => onSelectTrip(trip.id)} onDelete={() => onDeleteTrip(trip.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium text-slate-700">まだ旅のプランがありません</h3>
                    <p className="text-slate-500 mt-2">「新しい旅を作成」ボタンから、最初の旅の計画を始めましょう！</p>
                </div>
            )}
            
            <CreateTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTrip={onAddTrip} />
        </div>
    );
};

export default TripView;