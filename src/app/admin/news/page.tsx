'use client';

import { useState, useEffect, useCallback } from 'react';
import { NewsManager } from '@/components/news/news-manager';
import { NewsForm } from '@/components/news/news-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Newspaper, Loader2, RefreshCcw, PlusCircle } from 'lucide-react';

// Centralized API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api/news`;

export default function AdminNewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const { toast } = useToast();

    // 1. Fetch News
    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(API_BASE_URL);
            if (!res.ok) throw new Error('Database connection failed');
            const data = await res.json();
            
            // Backend se aane wala data ab parsed JSON images contain karega
            setNews(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err);
            toast({
                variant: "destructive",
                title: "Fetch Error",
                description: "MySQL server se data load nahi ho saka.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { 
        fetchNews(); 
    }, [fetchNews]);

    // 2. Save/Update Logic (FormData for Multiple Files)
    const handleSave = async (formData: FormData) => {
        setIsSaving(true);
        try {
            const url = editingArticle 
                ? `${API_BASE_URL}/${editingArticle.id}` 
                : API_BASE_URL;
            
            const method = editingArticle ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formData, // FormData automatically handles multiple files & headers
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Save failed');
            }

            toast({
                title: "Cloud Synced",
                description: editingArticle ? "Article updated successfully." : "New news launched with multiple assets.",
            });

            setIsFormOpen(false);
            setEditingArticle(null);
            fetchNews(); 
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: err.message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFDFF] p-6 lg:p-10 space-y-8">
            {/* Header UI Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <p className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">Communication Hub</p>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
                        News <span className="text-primary not-italic">& Updates</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchNews}
                        disabled={loading}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
                    >
                        <RefreshCcw className={`h-5 w-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => { setEditingArticle(null); setIsFormOpen(true); }}
                        className="h-12 px-6 bg-primary text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2"
                    >
                        <PlusCircle size={18} /> Compose Post
                    </button>
                </div>
            </div>

            {/* Manager Component */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 overflow-hidden">
                <NewsManager 
                    news={news} 
                    isLoading={loading} 
                    error={error}
                    onRefresh={fetchNews}
                    onEdit={(article) => {
                        setEditingArticle(article);
                        setIsFormOpen(true);
                    }}
                    onAddNew={() => {
                        setEditingArticle(null);
                        setIsFormOpen(true);
                    }}
                />
            </div>

            {/* Create/Edit Popup Dialog */}
            <Dialog open={isFormOpen} onOpenChange={(open) => !isSaving && setIsFormOpen(open)}>
                <DialogContent className="max-w-5xl rounded-[3rem] p-0 border-none overflow-hidden shadow-2xl">
                    {/* Sticky Modal Header */}
                    <div className="bg-slate-950 p-8 text-white border-b border-white/5">
                        <DialogHeader>
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-primary rounded-[1.5rem] shadow-xl shadow-primary/30">
                                    <Newspaper className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                                        {editingArticle ? 'Optimize' : 'Publish'} <span className="text-primary">Content</span>
                                    </DialogTitle>
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                                        Server: rs_db • Status: Active Sync
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>
                    
                    {/* Scrollable Form Area */}
                    <div className="p-10 relative bg-white max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {isSaving && (
                            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                                <div className="relative">
                                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full"></div>
                                </div>
                                <p className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 mt-6 italic">Uploading Assets to Cloud...</p>
                            </div>
                        )}
                        
                        <NewsForm 
                            article={editingArticle} 
                            onSave={handleSave} 
                            isSaving={isSaving} 
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}