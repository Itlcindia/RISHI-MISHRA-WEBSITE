'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Globe, Zap, Target, BarChart3, Fingerprint, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// 1. UPDATE: Hardcoded localhost ko hatakar environment variable lagaya
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function InitiativesPage() {
    const { language } = useTranslation();
    const [initiatives, setInitiatives] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitiatives = async () => {
            try {
                setIsLoading(true);
                // 2. Dynamic API call based on environment
                const res = await fetch(`${API_BASE_URL}/api/initiatives`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setInitiatives(data);
                setFilteredData(data);
            } catch (err) { 
                console.error("Initiatives Fetch Error:", err); 
            } 
            finally { setIsLoading(false); }
        };
        fetchInitiatives();
    }, []);

    useEffect(() => {
        const results = initiatives.filter(item => {
            const title = language === 'hi' ? (item.titleHi || item.titleEn) : item.titleEn;
            return title?.toLowerCase().includes(search.toLowerCase());
        });
        setFilteredData(results);
    }, [search, initiatives, language]);

    const icons = [<Target key="1" />, <Fingerprint key="2" />, <BarChart3 key="3" />, <Zap key="4" />];

    return (
        <div className="bg-[#f8fafc] dark:bg-[#020617] min-h-screen font-sans">
            
            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/h.jpeg" 
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-[#f8fafc] dark:to-[#020617]" />
                </div>

                <div className="container relative z-10 mx-auto px-6">
                    <div className="max-w-4xl">
                        <Badge className="bg-primary/20 text-primary border border-primary/30 mb-8 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-md">
                            Operational Units / Live
                        </Badge>
                        <h1 className={`text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] mb-8 ${language === 'hi' ? 'font-hindi' : ''}`}>
                            {language === 'hi' ? 'हमारी पहल' : 'Our Initiatives.'}
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl leading-relaxed">
                            Deploying advanced modular systems designed for global impact and systemic infrastructure development.
                        </p>
                    </div>
                </div>
            </section>

            {/* 2. Search & Metrics */}
            <section className="container mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 w-full md:max-w-md">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Filter by system name..." 
                            className="border-none bg-transparent focus-visible:ring-0 text-sm font-bold p-0 h-auto"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-8 ml-auto pr-8">
                        <div className="text-center">
                            <span className="block text-[10px] uppercase font-black text-slate-400 tracking-widest">Active Nodes</span>
                            <span className="text-xl font-mono font-black">{filteredData.length}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
                        <div className="text-center">
                            <span className="block text-[10px] uppercase font-black text-slate-400 tracking-widest">Status</span>
                            <span className="text-xl font-mono font-black text-emerald-500 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> NOMINAL
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Grid Section */}
            <section className="pt-20 pb-32">
                <div className="container mx-auto px-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-[3rem]" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredData.map((item, index) => (
                                <div 
                                    key={item.id} 
                                    className="group relative h-[550px] flex flex-col rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] hover:-translate-y-3"
                                >
                                    {/* Background Image Logic */}
                                    <div className="absolute inset-0 z-0">
                                        {item.image ? (
                                            <img 
                                                src={`${API_BASE_URL}/uploads/initiatives/${item.image}`}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                alt={item.titleEn}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                                <Globe className="h-20 w-20 text-slate-700 animate-pulse" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col h-full p-10 text-white">
                                        <div className="flex justify-between items-start mb-auto">
                                            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 text-primary-foreground">
                                                {icons[index % icons.length]}
                                            </div>
                                            <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 font-mono text-[10px] tracking-widest uppercase py-1">
                                                NODE-{item.id}
                                            </Badge>
                                        </div>

                                        <div className="mt-auto space-y-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-[2px] w-12 bg-primary rounded-full" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Online</span>
                                            </div>

                                            <h3 className={`text-3xl md:text-4xl font-black tracking-tight leading-[1.1] ${language === 'hi' ? 'font-hindi' : ''}`}>
                                                {language === 'hi' ? item.titleHi : item.titleEn}
                                            </h3>

                                            <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 font-medium opacity-0 translate-y-6 transition-all duration-700 group-hover:opacity-100 group-hover:translate-y-0">
                                                {language === 'hi' ? item.descriptionHi : item.descriptionEn}
                                            </p>

                                            <div className="pt-8 flex items-center justify-between border-t border-white/10">
                                                <div className="space-y-1">
                                                    <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Global Protocol</span>
                                                    <span className="block text-xs font-bold text-white tracking-tight">Active Deployment</span>
                                                </div>
                                                <button className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg shadow-primary/20">
                                                    <ArrowUpRight className="h-6 w-6" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}