'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GalleryManager } from '@/components/admin/gallery-manager';
import { GalleryForm } from '@/components/admin/gallery-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, Loader2, RefreshCcw, LayoutGrid } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api/gallery`;

export default function GalleryAdminPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const { toast } = useToast();

  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error("Failed to fetch gallery data.");
      const data = await res.json();
      setGallery(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "Fetch Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleAddNew = () => {
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedImage(item);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const isEditing = !!selectedImage;
      const url = isEditing 
        ? `${API_BASE_URL}/${selectedImage.id}` 
        : API_BASE_URL;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: formData, 
      });

      if (response.ok) {
        toast({
          title: isEditing ? "Entry Synchronized" : "Media Archived",
          description: `Successfully ${isEditing ? 'updated' : 'uploaded'} to the NGO vault.`,
        });
        setIsModalOpen(false);
        fetchGallery();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Server rejected the request.");
      }
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-2 bg-primary rounded-full" />
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
              Media <span className="text-primary not-italic">Engine</span>
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
            <LayoutGrid size={14} className="text-primary" />
            Visual Impact Management System
          </p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <button 
            onClick={fetchGallery}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-slate-200 hover:bg-slate-100 transition-all"
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </button>
          <button 
            onClick={handleAddNew}
            className="flex-[2] md:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-primary transition-all hover:-translate-y-1"
          >
            <ImagePlus className="h-4 w-4" /> Add Collection
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-2 md:p-8">
        <GalleryManager 
          gallery={gallery} 
          isLoading={isLoading} 
          onEdit={handleEdit} 
          onRefresh={fetchGallery} 
        />
      </div>

      {/* Dialog with Custom Scrollbar & Design */}
      <Dialog 
        open={isModalOpen} 
        onOpenChange={(open) => !isSaving && setIsModalOpen(open)}
      >
        <DialogContent className="max-w-4xl rounded-[3rem] p-0 border-none overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] bg-white">
          <div className="bg-slate-900 px-10 py-12 text-white relative overflow-hidden">
            {/* Abstract Background Shape */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                <span className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center not-italic shadow-lg shadow-primary/20">
                  <ImagePlus className="h-6 w-6 text-white" />
                </span>
                {selectedImage ? 'Update' : 'Deploy'} <span className="text-primary">Assets</span>
              </DialogTitle>
              <div className="flex gap-4 mt-4">
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full">
                  Batch Upload: Enabled (Max 10)
                </p>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full">
                  Format: optimized webp/jpg
                </p>
              </div>
            </DialogHeader>
          </div>
          
          <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar bg-white">
            {isSaving && (
              <div className="absolute inset-0 z-[60] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 bg-primary/10 rounded-full animate-ping" />
                  </div>
                </div>
                <p className="font-black uppercase text-xs text-slate-900 tracking-[0.3em] mt-6 animate-pulse">
                  Uploading to Cloud Storage...
                </p>
              </div>
            )}
            
            <GalleryForm 
              galleryImage={selectedImage} 
              onSave={handleSave} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}