'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, Sparkles, FileType, BarChart, Bot } from 'lucide-react';

const IngestorPage = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [file, setFile] = useState<any>(null);

    const handleProcess = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setResult({
                material: 'PLANCHA LAC A36 3/16"',
                weight: '1,450.50',
                suggestion: 'Se recomienda usar corte por plasma CNC para optimizar el retal de esta plancha.',
                profiles: ['Angular 2x2x1/4', 'Tubo Redondo 3"', 'Canal U 4"']
            });
            setAnalyzing(false);
        }, 3000);
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto py-6">
            <div className="text-center border-b border-gray-100 pb-8">
                <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight flex items-center justify-center gap-4">
                    <Sparkles className="text-green-800" size={32} /> Ingestor Cognitivo IA
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">Extractor automático de metrados y piezas desde ingeniería industrial</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-green-800 transition-all cursor-pointer group shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:text-green-800 transition-colors mb-6 shadow-inner">
                            <UploadCloud size={40} />
                        </div>
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight mb-2">Subir Planos o Cotizaciones</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px]">Formatos soportados: PDF, DXF, DWG o archivos de Excel</p>
                        <button className="mt-8 px-8 py-2.5 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase shadow-md hover:bg-green-900 transition-all opacity-0 group-hover:opacity-100">Seleccionar Archivo</button>
                    </div>

                    <div className="bg-gray-800 text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileType size={80} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-green-400">Instrucciones de Uso</h4>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                                <span className="w-5 h-5 bg-green-800 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                                Carga el archivo de ingeniería (PDF o Excel)
                            </li>
                            <li className="flex gap-3 text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                                <span className="w-5 h-5 bg-green-800 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                                El agente Gemini Vision extraerá las piezas y especificaciones
                            </li>
                            <li className="flex gap-3 text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                                <span className="w-5 h-5 bg-green-800 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                                Revisa y exporta directamente a la Cotización
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Processing & Results Section */}
                <div className="flex flex-col gap-6">
                    {!analyzing && !result && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4 text-gray-300 h-full">
                            <FileText size={48} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Esperando archivo para análisis...</p>
                            <button onClick={handleProcess} className="mt-4 px-6 py-2 border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-500 hover:bg-gray-50 hover:text-green-800 transition-all">Procesar Mock de Prueba</button>
                        </div>
                    )}

                    {analyzing && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-6 h-full shadow-sm">
                            <Loader2 size={48} className="text-green-800 animate-spin" />
                            <div>
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight mb-2">Analizando Estructura...</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">El motor IA está despiezando la ingeniería y calculando pesos teóricos.</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative border-l-4 border-l-green-800">
                                <div className="flex items-center gap-3 text-green-800 mb-6">
                                    <CheckCircle size={20} />
                                    <h3 className="text-xs font-black uppercase tracking-tight">Análisis Completado con Éxito</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Material Predominante</div>
                                        <div className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{result.material}</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Peso Estimado</div>
                                        <div className="text-[14px] font-black text-green-800 uppercase tracking-tight">{result.weight} KG</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
                                    <div className="flex items-center gap-2 text-blue-900 mb-2">
                                        <Bot size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-tight">Análisis del Agente</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase italic">"{result.suggestion}"</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <BarChart size={12} /> Despiece Detectado
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.profiles.map((p: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-md text-[9px] font-black uppercase text-gray-600 shadow-sm">{p}</span>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-full mt-8 py-3 bg-green-800 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-green-900 transition-all">Enviar a Nueva Cotización</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IngestorPage;
