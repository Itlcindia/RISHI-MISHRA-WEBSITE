'use client';

import * as React from 'react'; // Added explicit react import
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, ArrowRight, Newspaper, 
  TrendingUp, Zap, Globe, Layers 
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { hi, enUS } from 'date-fns/locale';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface NewsItem {
  id: string;
  titleEn: string;
  titleHi: string;
  category: string;
  images: string; 
  publishDate: string; 
}

export default function NewsListingPage() {
  const { language } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'General', 'Upcoming Event', 'Press Release', 'Urgent Alert'];
  const locale = language === 'hi' ? hi : enUS;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/news`);
        if (!res.ok) throw new Error("Failed to load news");
        const data = await res.json();
        setNews(data);
        setFilteredNews(data);
      } catch (err) { 
        console.error("News Fetch Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = news.filter(item => {
      const title = language === 'hi' ? (item.titleHi || item.titleEn) : item.titleEn;
      const matchesSearch = title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredNews(filtered);
  }, [searchQuery, selectedCategory, news, language]);

  // Image Helpers with Fallback Logic
  const getDisplayImage = (imagesStr: any) => {
    if (!imagesStr) return null;
    try {
      // Check if it's already an array or needs parsing
      const images = typeof imagesStr === 'string' ? JSON.parse(imagesStr) : imagesStr;
      return Array.isArray(images) && images.length > 0 ? images[0] : null;
    } catch (e) {
      return null;
    }
  };

  const getExtraCount = (imagesStr: any) => {
    if (!imagesStr) return 0;
    try {
      const images = typeof imagesStr === 'string' ? JSON.parse(imagesStr) : imagesStr;
      return Array.isArray(images) && images.length > 1 ? images.length - 1 : 0;
    } catch (e) { return 0; }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-zinc-950 font-poppins selection:bg-primary selection:text-white">
      {/* Breaking News Ticker */}
      <div className="bg-black dark:bg-zinc-100 text-white dark:text-black py-2.5 overflow-hidden whitespace-nowrap border-b border-zinc-800">
        <div className="flex animate-marquee items-center gap-8">
          {[1, 2, 3].map((i) => (
            <span key={i} className="flex items-center gap-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
              <Zap className="h-3 w-3 fill-yellow-400 text-yellow-400 animate-pulse" />
              {language === 'hi' ? 'ब्रेकिंग न्यूज़: डिजिटल इंडिया मिशन ने पकड़ी रफ्तार' : 'BREAKING: Digital India Mission Gains Momentum'}
              <span className="opacity-30">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden border-b-[8px] border-black dark:border-zinc-800">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
          style={{ backgroundImage: `url('/h.jpeg')` }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
        <div className="max-w-7xl mx-auto px-4 relative z-20 w-full text-center">
          <Badge className="bg-primary text-white border-none px-6 py-2 rounded-full font-bold uppercase tracking-widest mb-8">
            <Globe className="h-4 w-4 mr-2" />
            {language === 'hi' ? 'ग्लोबल न्यूज़ डेस्क' : 'Global News Desk'}
          </Badge>
          <h1 className={`text-6xl md:text-[100px] font-black leading-[0.85] tracking-tighter text-white uppercase ${language === 'hi' ? 'font-hindi' : ''}`}>
            {language === 'hi' ? 'समाचार' : 'THE'}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 block md:inline md:ml-4">
              {language === 'hi' ? 'पत्रिका' : 'INSIGHT'}
            </span>
          </h1>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-30">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-[2.5rem] border-4 border-black dark:border-zinc-700 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400" />
            <Input 
              placeholder={language === 'hi' ? "सर्च करें..." : "Search news archives..."}
              className="pl-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 border-none rounded-[1.8rem] text-xl font-bold focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar py-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => <div key={i} className="h-[450px] bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-[3rem]" />)}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredNews.map((item) => {
              const displayImage = getDisplayImage(item.images);
              const extraCount = getExtraCount(item.images);
              
              // Safety check for Date Parsing
              const dateObj = item.publishDate ? parseISO(item.publishDate) : new Date();

              return (
                <Link key={item.id} href={`/news/${item.id}`} className="group">
                  <article className="h-full bg-white dark:bg-zinc-900 border-4 border-black dark:border-zinc-800 rounded-[3rem] overflow-hidden transition-all duration-500 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 flex flex-col">
                    <div className="relative h-72 w-full overflow-hidden border-b-4 border-black bg-zinc-50">
                      {displayImage ? (
                        <img 
                          src={`${API_BASE}/uploads/news/${displayImage}`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          alt={item.titleEn} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <Newspaper className="h-16 w-16 text-zinc-200" />
                          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">No Media Found</span>
                        </div>
                      )}
                      
                      {extraCount > 0 && (
                        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/20">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-black">+{extraCount} PHOTOS</span>
                        </div>
                      )}

                      <Badge className="absolute top-6 left-6 bg-yellow-400 text-black border-2 border-black font-black px-4 py-1">
                        {item.category || 'NEWS'}
                      </Badge>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {isValid(dateObj) ? format(dateObj, 'PPP', { locale }) : 'Recently Published'}
                        </span>
                      </div>
                      <h3 className={`text-2xl font-black mb-6 leading-tight group-hover:text-primary transition-colors line-clamp-2 ${language === 'hi' ? 'font-hindi' : ''}`}>
                        {language === 'hi' ? (item.titleHi || item.titleEn) : item.titleEn}
                      </h3>
                      <div className="mt-auto pt-6 border-t-2 border-dashed border-zinc-100 flex items-center justify-between">
                        <span className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 group-hover:gap-4 transition-all">
                          {language === 'hi' ? 'पूरा पढ़ें' : 'View Story'} <ArrowRight className="h-5 w-5 text-primary" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center gap-4">
             <Newspaper className="h-20 w-20 text-zinc-200" />
             <h3 className="text-2xl font-black text-zinc-400 italic">WE COULDN'T FIND ANY STORIES MATCHING YOUR SEARCH.</h3>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-flex; animation: marquee 30s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
