'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InitiativesManager } from '@/components/admin/initiatives-manager';
import { InitiativeForm } from '@/components/admin/initiative-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Target, Loader2, RefreshCcw, PlusCircle } from 'lucide-react';

// Env URL fallback ke saath
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api/initiatives`;

export default function AdminInitiativesPage() {
    const [initiatives, setInitiatives] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<any>(null);
    const { toast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // 1. Fetch from MySQL (Memoized for performance)
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(API_BASE_URL);
            if (!res.ok) throw new Error("Failed to load data from MySQL server.");
            const data = await res.json();
            setInitiatives(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err);
            toast({ 
                title: "Fetch Error", 
                description: err.message, 
                variant: "destructive" 
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    // 2. Handlers
    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    // 3. Global Save (Multipart/FormData support)
    const handleSave = async (formData: FormData) => {
        setIsSaving(true);
        try {
            const url = editingItem 
                ? `${API_BASE_URL}/${editingItem.id}` 
                : API_BASE_URL;
            
            const response = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                body: formData, // Automatic handling for Multer
            });

            if (response.ok) {
                toast({ 
                    title: editingItem ? "Initiative Updated" : "Entry Successful",
                    description: "MySQL database has been synchronized." 
                });
                setIsModalOpen(false);
                setEditingItem(null);
                fetchData();
            } else {
                const errData = await response.json();
                throw new Error(errData.error || "Server rejected the data.");
            }
        } catch (err: any) {
            toast({ 
                title: "Save Failed", 
                description: err.message, 
                variant: "destructive" 
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFDFF] p-6 lg:p-10 space-y-8">
            {/* Professional Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <p className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">Strategic Projects</p>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
                        NGO <span className="text-primary not-italic">Initiatives</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchData}
                        disabled={isLoading}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
                    >
                        <RefreshCcw className={`h-5 w-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={handleAddNew}
                        className="h-12 px-6 bg-primary text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex items-center gap-2"
                    >
                        <PlusCircle size={18} /> New Initiative
                    </button>
                </div>
            </div>

            {/* Manager Component Container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 overflow-hidden">
                <InitiativesManager 
                    initiatives={initiatives}
                    isLoading={isLoading}
                    error={error}
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onRefresh={fetchData}
                />
            </div>

            {/* Editor Dialog */}
            <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!isSaving) {
                    setIsModalOpen(open);
                    if(!open) setEditingItem(null);
                }
            }}>
                <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 border-none overflow-hidden shadow-2xl">
                    <div className="bg-slate-900 p-8 text-white">
                        <DialogHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary rounded-2xl shadow-lg">
                                   <Target className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                        {editingItem ? 'Edit' : 'Create'} <span className="text-primary">Initiative</span>
                                    </DialogTitle>
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                                        Impact Tracking & Data Sync Active
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-10 relative bg-white max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {isSaving && (
                            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                <p className="font-black uppercase text-xs tracking-widest text-slate-400 italic">Updating Cloud Storage...</p>
                            </div>
                        )}
                        
                        <InitiativeForm 
                            initiative={editingItem} 
                            onSave={handleSave} 
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}