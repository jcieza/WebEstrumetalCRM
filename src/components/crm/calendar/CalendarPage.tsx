'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter,
    Package, Clock, AlertCircle, CheckCircle, Truck, MoreVertical
} from 'lucide-react';

const getEventStyle = (status: string) => {
    switch (status) {
        case 'urgent': return { bg: '#FFEBEE', border: '#EF5350', color: '#C62828' };
        case 'pending': return { bg: '#FFF3E0', border: '#FFA726', color: '#E65100' };
        case 'progress': return { bg: '#E3F2FD', border: '#42A5F5', color: '#1565C0' };
        case 'completed': return { bg: '#F5F5F5', border: '#9E9E9E', color: '#616161' };
        default: return { bg: '#F5F5F5', border: '#BDBDBD', color: '#666' };
    }
};

const CalendarPage = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        // Mock data
        setEvents([
            { id: 'OP-101', date: '2025-12-10', title: 'OP-101 Ace. Arequipa', status: 'urgent' },
            { id: 'OP-102', date: '2025-12-12', title: 'OP-102 Metales SAC', status: 'progress' },
        ]);
    }, []);

    const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    const { firstDay, daysInMonth } = (() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysInMonth };
    })();

    const getEventsForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                        <CalendarIcon size={28} className="text-green-800" /> Planificación de Entregas
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Control logístico y plazos de planta</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase hover:bg-green-900 transition-all shadow-md">
                        <Plus size={14} /> Programar Entrega
                    </button>
                </div>
            </div>

            {/* Calendar Controls & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar Info */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Estado Logístico</h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Urgente', status: 'urgent' },
                                { label: 'En Proceso', status: 'progress' },
                                { label: 'Programado', status: 'pending' },
                                { label: 'Completado', status: 'completed' },
                            ].map(item => {
                                const style = getEventStyle(item.status);
                                return (
                                    <div key={item.status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: style.border }} />
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{item.label}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-gray-400">0</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Calendar View */}
                <div className="lg:col-span-3 bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                    {/* Navigation */}
                    <div className="p-4 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                            <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest min-w-[150px] text-center">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={20} /></button>
                        </div>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 bg-white border border-gray-200 rounded-md text-[9px] font-black uppercase text-gray-500 hover:bg-gray-50 transition-all">Hoy</button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 bg-gray-50/30 border-b border-gray-100">
                        {dayNames.map(day => (
                            <div key={day} className="p-3 text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
                        ))}
                    </div>

                    {/* Matrix Grid */}
                    <div className="grid grid-cols-7">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-2 min-h-[120px] bg-gray-50/20 border-r border-b border-gray-50" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayEvents = getEventsForDate(day);
                            const isToday = day === today.getDate() &&
                                currentDate.getMonth() === today.getMonth() &&
                                currentDate.getFullYear() === today.getFullYear();

                            return (
                                <div key={day}
                                    onClick={() => setSelectedDate(day)}
                                    className={`p-2 min-h-[120px] border-r border-b border-gray-50 transition-all cursor-pointer hover:bg-gray-50/50 ${selectedDate === day ? 'bg-green-50/30' : ''}`}
                                >
                                    <div className={`w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-md mb-2 ${isToday ? 'bg-green-800 text-white shadow-sm' : 'text-gray-400'}`}>
                                        {day}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {dayEvents.map(event => {
                                            const style = getEventStyle(event.status);
                                            return (
                                                <div key={event.id} className="p-1 px-2 rounded-md text-[8px] font-black uppercase truncate border-l-2" style={{ backgroundColor: style.bg, color: style.color, borderColor: style.border }}>
                                                    {event.title}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
