'use client';

import { useState, useEffect, useCallback } from 'react';
import { HeroManager } from '@/components/admin/hero-manager';
import { HeroForm } from '@/components/admin/hero-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Loader2, RefreshCcw } from 'lucide-react';

// Environment variables for API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api/hero`;

export default function AdminHeroPage() {
  const [heroData, setHeroData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState<any>(null);
  const { toast } = useToast();

  // 1. Fetch Hero Slides (MySQL Sync)
  const fetchHeroSlides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      // Ensure we always have an array
      setHeroData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({
        title: "Database Sync Error",
        description: "Express server check karein (Port 5000).",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHeroSlides();
  }, [fetchHeroSlides]);

  // 2. Optimized Save Function (Handles Multer + MySQL)
  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    const isEdit = !!selectedHero;
    const url = isEdit ? `${API_BASE_URL}/${selectedHero.id}` : API_BASE_URL;
    
    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: formData, // FormData automatic standard handling
      });

      if (res.ok) {
        toast({
          title: isEdit ? "Slide Synchronized" : "Slide Created",
          description: "MySQL database aur storage update ho chuka hai.",
        });
        setIsModalOpen(false);
        setSelectedHero(null);
        fetchHeroSlides(); // Refresh the list
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Server rejected the update.");
      }
    } catch (err: any) {
      toast({
        title: "Workflow Blocked",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFDFF] p-6 lg:p-10 space-y-8">
      
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <p className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">Frontend Assets</p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
            Hero <span className="text-primary not-italic">Engine</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchHeroSlides}
            disabled={loading}
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100 group"
          >
            <RefreshCcw className={`h-5 w-5 text-slate-400 group-hover:text-primary ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setSelectedHero(null); setIsModalOpen(true); }}
            className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Add New Slide
          </button>
        </div>
      </div>

      {/* Hero Table Manager */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4">
        <HeroManager 
          heroImages={heroData} 
          isLoading={loading}
          error={null} // Pass error if state management is used
          onAddNew={() => { setSelectedHero(null); setIsModalOpen(true); }}
          onEdit={(hero) => { setSelectedHero(hero); setIsModalOpen(true); }}
          onRefresh={fetchHeroSlides}
        />
      </div>

      {/* Full-Screen Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !isSaving && setIsModalOpen(open)}>
        <DialogContent className="max-w-4xl rounded-[3rem] p-0 border-none overflow-hidden shadow-2xl">
          
          {/* Modal Header Overlay */}
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                   <Rocket className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">
                    {selectedHero ? 'Refine' : 'Initialize'} <span className="text-primary not-italic">Hero Slide</span>
                  </DialogTitle>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">MySQL Record Sync Active</p>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          {/* Form Content Area */}
          <div className="p-10 relative bg-white max-h-[80vh] overflow-y-auto custom-scrollbar">
            {isSaving && (
              <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                    </div>
                </div>
                <p className="font-black uppercase text-xs tracking-widest text-slate-400 mt-6 animate-pulse">Synchronizing Data Assets...</p>
              </div>
            )}
            
            {/* The Actual Form Component */}
            <HeroForm 
                heroImage={selectedHero} 
                onSave={handleSave} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Global Scrollbar Style */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
}