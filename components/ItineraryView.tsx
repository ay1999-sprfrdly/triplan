
import React, { useState, FormEvent, useEffect } from 'react';
import pako from 'pako';
import type { Trip, ItineraryItem, DayPlan } from '../types';
import { getItinerarySuggestions } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';
import { BackIcon, PlusIcon, SparklesIcon, TrashIcon, ShareIcon, LinkIcon, DocumentTextIcon } from './common/Icons';
import { escapeHTML } from '../utils';

interface ItineraryViewProps {
    trip: Trip;
    onBack: () => void;
    onUpdateTrip: (updatedTrip: Trip) => void;
    isReadOnly?: boolean;
}

const AISuggestionsModal: React.FC<{ trip: Trip; day: DayPlan; isOpen: boolean; onClose: () => void; onAddItems: (items: ItineraryItem[]) => void; }> = ({ trip, day, isOpen, onClose, onAddItems }) => {
    const [interests, setInterests] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<ItineraryItem[]>([]);
    const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<Set<string>>(new Set());

    const handleFetchSuggestions = async () => {
        setIsLoading(true);
        const fetchedSuggestions = await getItinerarySuggestions(trip.destination, interests);
        setSuggestions(fetchedSuggestions);
        setIsLoading(false);
    };

    const toggleSelection = (id: string) => {
        setSelectedSuggestionIds((prev: Set<string>) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleAddSelected = () => {
        const itemsToAdd = suggestions.filter((s: ItineraryItem) => selectedSuggestionIds.has(s.id));
        onAddItems(itemsToAdd);
        onClose();
    };
    
    // Reset state when modal is closed/reopened
    useEffect(() => {
        if(isOpen) {
            setInterests('');
            setSuggestions([]);
            setSelectedSuggestionIds(new Set());
            setIsLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-slate-800">AIによる旅程提案</h2>
                <p className="text-sm text-slate-500 mb-4">{new Date(day.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}のプランをAIに提案してもらいましょう。</p>
                
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={interests} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterests(e.target.value)}
                        placeholder="興味・関心を入力 (例: グルメ, 歴史, 自然)" 
                        className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button onClick={handleFetchSuggestions} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md shadow-sm hover:bg-emerald-700 disabled:bg-slate-400 flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5" /> 提案を生成
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto -mx-6 px-6">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center"><LoadingSpinner text="提案を考えています..." /></div>
                ) : suggestions.length > 0 ? (
                    <div className="space-y-3">
                        {suggestions.map((item: ItineraryItem) => (
                             <div key={item.id} onClick={() => toggleSelection(item.id)} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedSuggestionIds.has(item.id) ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                                 <div className="flex items-start gap-4">
                                    <input type="checkbox" readOnly checked={selectedSuggestionIds.has(item.id)} className="mt-1 h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
                                     <div>
                                         <p className="font-bold text-slate-800">{item.time} - {item.title}</p>
                                         <p className="text-sm text-slate-600">{item.description}</p>
                                     </div>
                                 </div>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">興味・関心を入力して提案を生成してください。</div>
                )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200">閉じる</button>
                    <button onClick={handleAddSelected} disabled={selectedSuggestionIds.size === 0} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md shadow-sm hover:bg-emerald-700 disabled:bg-slate-400">選択した{selectedSuggestionIds.size}件を追加</button>
                </div>
            </div>
        </div>
    );
};

const ItineraryView: React.FC<ItineraryViewProps> = ({ trip, onBack, onUpdateTrip, isReadOnly = false }) => {
    const [activeTab, setActiveTab] = useState<number | 'memo'>(0);
    const [newItem, setNewItem] = useState<{ time: string; title: string; description: string; link: string }>({ time: '', title: '', description: '', link: '' });
    const [isAISuggestionsModalOpen, setAISuggestionsModalOpen] = useState<boolean>(false);
    const [showCopyNotification, setShowCopyNotification] = useState<boolean>(false);

    const activeDay = typeof activeTab === 'number' ? trip.days[activeTab] : null;

    const handleShare = () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}#/share/${trip.id}`;
        navigator.clipboard.writeText(shareUrl);
        setShowCopyNotification(true);
        setTimeout(() => setShowCopyNotification(false), 2000);
    };

    const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isReadOnly) return;
        onUpdateTrip({ ...trip, memo: e.target.value });
    };

    const handleAddItem = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newItem.title || !newItem.time || isReadOnly || !activeDay || typeof activeTab !== 'number') return;

        const updatedDay: DayPlan = {
            ...activeDay,
            items: [...activeDay.items, { ...newItem, id: Date.now().toString() }].sort((a, b) => a.time.localeCompare(b.time)),
        };
        const updatedTrip: Trip = {
            ...trip,
            days: trip.days.map((day, index) => index === activeTab ? updatedDay : day),
        };
        onUpdateTrip(updatedTrip);
        setNewItem({ time: '', title: '', description: '', link: '' });
    };
    
    const handleAddSuggestedItems = (itemsToAdd: ItineraryItem[]) => {
         if (isReadOnly || !activeDay || typeof activeTab !== 'number') return;
        const updatedDay: DayPlan = {
            ...activeDay,
            items: [...activeDay.items, ...itemsToAdd].sort((a, b) => a.time.localeCompare(b.time)),
        };
        const updatedTrip: Trip = {
            ...trip,
            days: trip.days.map((day, index) => index === activeTab ? updatedDay : day),
        };
        onUpdateTrip(updatedTrip);
    };

    const handleDeleteItem = (itemId: string) => {
        if (isReadOnly || !activeDay || typeof activeTab !== 'number') return;
        const updatedDay: DayPlan = {
            ...activeDay,
            items: activeDay.items.filter(item => item.id !== itemId),
        };
        const updatedTrip: Trip = {
            ...trip,
            days: trip.days.map((day, index) => index === activeTab ? updatedDay : day),
        };
        onUpdateTrip(updatedTrip);
    };

    return (
        <div>
            {showCopyNotification && (
                <div className="fixed top-20 right-1/2 translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
                    共有リンクをコピーしました！
                </div>
            )}
            <button onClick={onBack} className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                <BackIcon className="h-5 w-5" />
                {isReadOnly ? 'ホームに戻る' : '旅の一覧へ戻る'}
            </button>
            <div 
                className="relative w-full h-48 md:h-56 rounded-lg shadow-lg mb-6 p-6 flex flex-col justify-end"
                style={{ backgroundColor: trip.color }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.25)]">{escapeHTML(trip.title)}</h2>
                <p className="text-lg text-slate-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">{escapeHTML(trip.destination)}</p>
                {isReadOnly && (
                    <div className="absolute top-0 left-0 w-full p-2 bg-black/20 text-white text-center text-sm font-semibold">
                        共有された旅程 (閲覧専用)
                    </div>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="border-b border-slate-200 mb-4">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto">
                        {trip.days.map((day, index) => (
                            <button
                                key={day.date}
                                onClick={() => setActiveTab(index)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === index
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {new Date(day.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} (Day {index + 1})
                            </button>
                        ))}
                        <button
                            key="memo"
                            onClick={() => setActiveTab('memo')}
                            className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'memo'
                                    ? 'border-emerald-500 text-emerald-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <DocumentTextIcon className="h-5 w-5 mr-1" />
                            メモ
                        </button>
                    </nav>
                </div>
                 
                {activeDay && (
                <>
                    {!isReadOnly && (
                        <div className="mb-6 flex justify-between items-center">
                            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 transition-colors">
                                <ShareIcon className="h-5 w-5" />
                                共有
                            </button>
                            <button onClick={() => setAISuggestionsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg shadow-md hover:opacity-90 transition-opacity">
                                <SparklesIcon className="h-5 w-5" />
                                AIに旅程を提案してもらう
                            </button>
                        </div>
                    )}
                    
                    {activeDay.items.length > 0 ? (
                        <div className="space-y-4">
                            {activeDay.items.map((item: ItineraryItem) => (
                                <div key={item.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div className="text-lg font-bold text-emerald-600 w-16 text-center">{item.time}</div>
                                    <div className="flex-1 border-l-2 border-emerald-200 pl-4">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-slate-800">{escapeHTML(item.title)}</h4>
                                            {item.link && (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700 transition-colors">
                                                    <LinkIcon className="h-5 w-5" />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600">{escapeHTML(item.description)}</p>
                                    </div>
                                    {!isReadOnly && (
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500">この日の予定はまだありません。</div>
                    )}
                    
                    {!isReadOnly && (
                        <form onSubmit={handleAddItem} className="mt-6 p-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
                            <div className="lg:col-span-1">
                                <label className="block text-xs font-medium text-slate-500">時間</label>
                                <input type="time" value={newItem.time} onChange={e => setNewItem({...newItem, time: e.target.value})} required className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <div className="md:col-span-2 lg:col-span-1">
                                <label className="block text-xs font-medium text-slate-500">タイトル</label>
                                <input type="text" placeholder="例: 美ら海水族館" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} required className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <div className="md:col-span-3 lg:col-span-1">
                                <label className="block text-xs font-medium text-slate-500">メモ</label>
                                <input type="text" placeholder="詳細やメモ" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <div className="md:col-span-2 lg:col-span-1">
                                <label className="block text-xs font-medium text-slate-500">予約リンク</label>
                                <input type="url" placeholder="https://..." value={newItem.link} onChange={e => setNewItem({...newItem, link: e.target.value})} className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"/>
                            </div>
                            <button type="submit" className="md:col-span-1 px-4 py-2 bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 h-9">
                                <PlusIcon className="h-5 w-5"/>追加
                            </button>
                        </form>
                    )}
                </>
                )}

                {activeTab === 'memo' && (
                     <div className="py-4">
                        <textarea
                            value={trip.memo || ''}
                            onChange={handleMemoChange}
                            readOnly={isReadOnly}
                            className="w-full h-96 p-4 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 resize-none text-slate-700 leading-relaxed"
                            placeholder="持ち物リスト、予約番号、緊急連絡先など、旅行に関するメモを自由に残せます。"
                        />
                    </div>
                )}
            </div>
             {activeDay && !isReadOnly && (
                <AISuggestionsModal 
                    trip={trip}
                    day={activeDay}
                    isOpen={isAISuggestionsModalOpen} 
                    onClose={() => setAISuggestionsModalOpen(false)} 
                    onAddItems={handleAddSuggestedItems}
                />
            )}
        </div>
    );
};

export default ItineraryView;