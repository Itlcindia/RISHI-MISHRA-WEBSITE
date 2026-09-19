'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, Share2, Printer, Newspaper, 
  Clock, Calendar, Layers, CheckCircle2 
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { hi, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { language } = useTranslation();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const locale = language === 'hi' ? hi : enUS;

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/news/${id}`);
        if (!res.ok) throw new Error("Article not found");
        const data = await res.json();
        setArticle(data);
      } catch (err) { 
        console.error("Fetch Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="relative mb-4">
          <Newspaper className="h-12 w-12 text-primary animate-bounce" />
        </div>
        <div className="text-sm font-bold tracking-widest text-zinc-400 uppercase">Loading Article...</div>
      </div>
    );
  }

  if (!article) return <div className="text-center py-40 font-bold text-xl uppercase tracking-widest text-zinc-400">Article Not Found</div>;

  const title = language === 'hi' ? (article.titleHi || article.titleEn) : article.titleEn;
  const content = language === 'hi' ? (article.contentHi || article.contentEn) : article.contentEn;
  
  // Safe Image Parsing
  let imageList: string[] = [];
  try {
    if (article.images) {
      const parsed = typeof article.images === 'string' ? JSON.parse(article.images) : article.images;
      imageList = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) { imageList = []; }

  const dateObj = article.publishDate ? parseISO(article.publishDate) : new Date();
  const formattedDate = isValid(dateObj) ? format(dateObj, 'PPP', { locale }) : 'Recently Published';

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-primary/20">
      
      {/* 1. Immersive Header Section */}
      <section className="relative h-[80vh] w-full bg-zinc-900 flex items-end pb-20 overflow-hidden">
        {imageList.length > 0 && (
          <div className="absolute inset-0">
            <img 
              src={`${API_BASE}/uploads/news/${imageList[activeImageIndex]}`} 
              className="w-full h-full object-cover opacity-60 scale-110 animate-ken-burns transition-all duration-1000" 
              alt="Backdrop" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          </div>
        )}
        
        <div className="container mx-auto px-6 relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full pl-2"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to News
          </Button>
          
          <Badge className="bg-primary text-white border-none px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-wider">
            {article.category}
          </Badge>
          
          <h1 className={`max-w-5xl text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8 ${language === 'hi' ? 'font-hindi' : ''}`}>
            {title}
          </h1>

          <div className="flex flex-wrap gap-6 items-center text-white/60 text-sm font-semibold uppercase tracking-widest">
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {formattedDate}</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Official Release</span>
          </div>
        </div>
      </section>

      {/* 2. Content & Gallery Section */}
      <section className="container mx-auto px-6 -mt-10 relative z-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            
            {/* Main Visual Component */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800">
              {imageList.length > 0 ? (
                <div className="p-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100">
                    <img 
                      src={`${API_BASE}/uploads/news/${imageList[activeImageIndex]}`} 
                      className="w-full h-full object-cover" 
                      alt="News Visual" 
                    />
                    {imageList.length > 1 && (
                      <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 border border-white/10">
                        <Layers className="h-3.5 w-3.5 text-primary" /> {activeImageIndex + 1} / {imageList.length} ASSETS
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnails Strip */}
                  {imageList.length > 1 && (
                    <div className="flex gap-3 p-3 overflow-x-auto no-scrollbar">
                      {imageList.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-primary shadow-lg scale-105' : 'border-transparent opacity-60'}`}
                        >
                          <img src={`${API_BASE}/uploads/news/${img}`} className="w-full h-full object-cover" alt="Thumbnail" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 italic text-zinc-400">
                  No images attached to this release.
                </div>
              )}

              {/* Text Block */}
              <div className="px-8 md:px-16 py-16">
                <div className={`prose prose-zinc prose-xl max-w-none dark:prose-invert leading-relaxed text-zinc-800 dark:text-zinc-200 ${language === 'hi' ? 'text-2xl font-hindi leading-[1.8]' : 'font-medium'}`}>
                  {content.split('\n').map((p: string, i: number) => (
                    p.trim() && <p key={i} className="mb-8 last:mb-0">{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sidebar Actions */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-8">Engagement Hub</p>
                <div className="space-y-4">
                  <Button 
                    className="w-full h-16 rounded-2xl bg-zinc-950 hover:bg-primary text-white font-bold flex justify-between px-8 group transition-all"
                    onClick={() => navigator.share({ title, url: window.location.href })}
                  >
                    SHARE NEWS <Share2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full h-16 rounded-2xl border-zinc-200 dark:border-zinc-800 font-bold flex justify-between px-8 hover:bg-zinc-50 transition-all"
                    onClick={() => window.print()}
                  >
                    PRINT REPORT <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                <Newspaper className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Verified Publication</h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-2">This is an official document from the RS Digital Archive. All information is timestamped and verified.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <style jsx global>{`
        @keyframes ken-burns { 
          0% { transform: scale(1); } 
          100% { transform: scale(1.15); } 
        }
        .animate-ken-burns { animation: ken-burns 30s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}