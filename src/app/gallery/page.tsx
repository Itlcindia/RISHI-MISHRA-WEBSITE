'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { StaggerItem, StaggerWrap } from '@/components/animations';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Search, Sparkles, ChevronLeft, ChevronRight, Layers, X, Info } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface GalleryItem {
  id: number;
  image: string | string[];
  title: string;
  titleHi?: string;
  category?: string;
}

export default function GalleryPage() {
  const { language } = useTranslation();
  const [photoGallery, setPhotoGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [activeAlbum, setActiveAlbum] = useState<string[] | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Helper: Get full image URL
  const getImageUrl = (name: string) => `${API_BASE_URL}/uploads/gallery/${name}`;

  // Robust Parser
  const parseImages = useCallback((imgData: any): string[] => {
    try {
      if (!imgData) return [];
      const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) { 
      console.warn("Image parsing failed:", e);
      return []; 
    }
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/gallery`);
        if (response.ok) {
          const data = await response.json();
          setPhotoGallery(data);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Keyboard Support for Gallery
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeAlbum) return;
    if (e.key === 'ArrowRight') setCurrentImgIndex(prev => (prev < activeAlbum.length - 1 ? prev + 1 : 0));
    if (e.key === 'ArrowLeft') setCurrentImgIndex(prev => (prev > 0 ? prev - 1 : activeAlbum.length - 1));
    if (e.key === 'Escape') setActiveAlbum(null);
  }, [activeAlbum]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Derived State: Filtered List & Categories
  const categories = useMemo(() => {
    const unique = Array.from(new Set(photoGallery.map(item => item.category || 'General')));
    return ['All', ...unique];
  }, [photoGallery]);

  const filteredGallery = useMemo(() => {
    return photoGallery.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(searchLower) || 
                           (item.titleHi && item.titleHi.includes(searchQuery));
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [photoGallery, searchQuery, selectedCategory]);

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen selection:bg-primary/20 transition-colors duration-500 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative h-[60vh] flex items-center overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="absolute inset-0 z-0 bg-cover bg-center animate-ken-burns transition-transform duration-[40s]" style={{ backgroundImage: `url('/h.jpeg')` }} />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-zinc-950" />
        
        <div className="container mx-auto px-6 relative z-20">
          <StaggerWrap className="space-y-6">
            <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md px-4 py-1.5 rounded-full uppercase tracking-tighter">
              <Sparkles size={14} className="mr-2 animate-pulse" /> NGO Digital Archives
            </Badge>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.8]">
              Visual <span className="text-primary not-italic">Vault</span>
            </h1>
            <div className="max-w-2xl relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-white outline-none focus:ring-4 ring-primary/20 transition-all placeholder:text-zinc-500 font-medium"
                placeholder={language === 'hi' ? "खोजें..." : "Search event titles, categories..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </StaggerWrap>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <div className="container mx-auto px-6 -mt-8 relative z-30">
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all whitespace-nowrap shadow-lg ${
                selectedCategory === cat 
                ? 'bg-primary text-white scale-105' 
                : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MASONRY GRID */}
      <section className="py-16 px-6 container mx-auto">
        <div className="columns-1 gap-8 space-y-8 sm:columns-2 lg:columns-3 xl:columns-4">
          {isLoading ? (
            Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900" />)
          ) : filteredGallery.length > 0 ? (
            filteredGallery.map((album) => {
              const images = parseImages(album.image);
              const displayTitle = language === 'hi' && album.titleHi ? album.titleHi : album.title;
              
              return (
                <StaggerItem key={album.id} className="break-inside-avoid">
                  <div 
                    onClick={() => { setActiveAlbum(images); setCurrentImgIndex(0); }}
                    className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl transition-all duration-700 hover:-translate-y-2 hover:shadow-primary/30"
                  >
                    <img
                      src={getImageUrl(images[0])}
                      alt={displayTitle}
                      className="w-full h-auto object-cover transition-transform duration-[2s] group-hover:scale-110"
                    />

                    {/* Badge Indicator */}
                    {images.length > 1 && (
                      <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-2 border border-white/10">
                        <Layers size={12} className="text-primary" /> {images.length} Photos
                      </div>
                    )}

                    {/* Hover Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                      <p className="text-white text-2xl font-black uppercase italic tracking-tighter leading-none mb-3">{displayTitle}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{album.category || 'Event'}</span>
                        <div className="bg-primary text-white p-3 rounded-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                          <Maximize2 size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-400">
               <Info className="mx-auto mb-4 opacity-20" size={48} />
               <p className="font-black uppercase tracking-widest text-xs">No memories found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* FULLSCREEN LIGHTBOX */}
      <Dialog open={!!activeAlbum} onOpenChange={() => setActiveAlbum(null)}>
        <DialogContent className="max-w-[100vw] w-screen h-screen bg-zinc-950/98 backdrop-blur-2xl border-none p-0 overflow-hidden m-0 rounded-none flex items-center justify-center">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          
          {/* Close Header */}
          <div className="absolute top-0 left-0 w-full p-8 z-[60] flex justify-between items-center pointer-events-none">
             <div className="bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 pointer-events-auto">
               <span className="text-white/50 text-[10px] font-black uppercase tracking-widest italic">Viewing Gallery</span>
             </div>
             <button onClick={() => setActiveAlbum(null)} className="pointer-events-auto bg-white/10 hover:bg-red-500 text-white p-4 rounded-full transition-all">
               <X size={24} />
             </button>
          </div>

          <div className="relative w-full h-full flex items-center justify-center group">
            {activeAlbum && (
              <>
                <div className="relative max-h-[85vh] w-full flex items-center justify-center px-4">
                  <img 
                    key={currentImgIndex} // Force re-render for animation
                    src={getImageUrl(activeAlbum[currentImgIndex])} 
                    className="max-h-full max-w-full object-contain shadow-2xl rounded-lg animate-in fade-in zoom-in-95 duration-500" 
                    alt="NGO Archive Detail"
                  />
                </div>

                {/* Slideshow Controls */}
                {activeAlbum.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(i => (i > 0 ? i - 1 : activeAlbum.length - 1)); }}
                      className="absolute left-8 p-6 rounded-full bg-white/5 hover:bg-primary text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hidden lg:block"
                    >
                      <ChevronLeft size={32} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(i => (i < activeAlbum.length - 1 ? i + 1 : 0)); }}
                      className="absolute right-8 p-6 rounded-full bg-white/5 hover:bg-primary text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hidden lg:block"
                    >
                      <ChevronRight size={32} />
                    </button>
                  </>
                )}

                {/* Bottom Navigation Status */}
                <div className="absolute bottom-12 bg-white/5 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10 flex items-center gap-6">
                  <span className="text-primary font-black text-xs">{currentImgIndex + 1} / {activeAlbum.length}</span>
                  <div className="h-4 w-px bg-white/20" />
                  <p className="text-white/40 font-bold uppercase text-[9px] tracking-widest italic">Navigate with Arrow Keys</p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes ken-burns {
          0% { transform: scale(1); }
          50% { transform: scale(1.1) translate(5px, -2px); }
          100% { transform: scale(1); }
        }
        .animate-ken-burns { animation: ken-burns 40s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}