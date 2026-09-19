
'use client';

import Link from 'next/link';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StaggerWrap, StaggerItem } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { UpcomingEvents } from '@/components/upcoming-events';
import { useTranslation } from '@/hooks/use-translation';
import Autoplay from 'embla-carousel-autoplay';
import { 
  BookOpen, 
  HeartHandshake, 
  Users, 
  ArrowRight, 
  Plus, 
  Newspaper, 
  Heart, 
  Leaf, 
  GraduationCap, 
  Droplets, 
  Laptop, 
  TreePine, 
  Zap, 
  Target, 
  Fingerprint, 
  BarChart3,
  PawPrint,
  Trees,
  X,
  Sparkles
} from 'lucide-react';
import AnimatedText from '@/components/animated-text';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const NewsSkeleton = () => (
    <StaggerItem>
        <Card className="flex h-full flex-col overflow-hidden border-none bg-slate-50 rounded-[2.5rem]">
            <Skeleton className="h-64 w-full" />
            <div className="p-8 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </Card>
    </StaggerItem>
);

const GallerySkeleton = () => (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="w-full h-80 rounded-[2.5rem] bg-slate-100" />
        ))}
    </div>
);

export default function Home() {
  const { t, language } = useTranslation();
  const autoplayPlugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const [api, setApi] = React.useState<CarouselApi>();
  const [filter, setFilter] = useState('All');
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  const [data, setData] = useState({
    articles: [],
    initiatives: [],
    heroImages: [],
    gallery: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Robust Image Parsing Utility
  const parseImageField = (imgData: any): string => {
    try {
      if (!imgData) return '';
      const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
      return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
      return typeof imgData === 'string' ? imgData : '';
    }
  };

  const getImageUrl = useCallback((path: string | undefined, type: string) => {
    if (!path) return 'https://placehold.co/800x600?text=NGO+Impact';
    if (path.startsWith('http')) return path; 
    return `${API_URL}/uploads/${type}/${path}`;
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const endpoints = ['news', 'initiatives', 'hero', 'gallery'];
        const [news, initiatives, hero, gallery] = await Promise.all(
          endpoints.map(endpoint => 
            fetch(`${API_URL}/api/${endpoint}`).then(res => res.ok ? res.json() : [])
          )
        );
        setData({ articles: news, initiatives, heroImages: hero, gallery });
      } catch (error) {
        console.error("Critical: Backend connection failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const initiativeIcons: Record<string, React.ReactNode> = {
    ngo: <HeartHandshake className="h-8 w-8" />,
    kisan: <Users className="h-8 w-8" />,
    youth: <BookOpen className="h-8 w-8" />,
    default: <Heart className="h-8 w-8" />
  };

  // Stats Data
  const stats = [
    { label: language === 'hi' ? 'प्रभावित जीवन' : 'Lives Impacted', value: '10K+', icon: <Users className="h-5 w-5" /> },
    { label: language === 'hi' ? 'सक्रिय परियोजनाएं' : 'Active Projects', value: '50+', icon: <Leaf className="h-5 w-5" /> },
    { label: language === 'hi' ? 'स्वयंसेवक' : 'Volunteers', value: '5000', icon: <Heart className="h-5 w-5" /> },
    { label: language === 'hi' ? 'अवार्ड्स' : 'Awards Won', value: '15+', icon: <Plus className="h-5 w-5" /> },
  ];

  // Filtering Logic
  const filteredInitiatives = useMemo(() => {
    if (filter === 'All') return data.initiatives;
    return data.initiatives.filter((item: any) => {
        if (filter === 'Education') return item.slug?.includes('youth') || item.titleEn?.toLowerCase().includes('education');
        if (filter === 'Social') return item.slug?.includes('ngo') || item.titleEn?.toLowerCase().includes('social');
        if (filter === 'Agriculture') return item.slug?.includes('kisan') || item.titleEn?.toLowerCase().includes('farmer');
        return true;
    });
  }, [filter, data.initiatives]);

  return (
    <div className="flex flex-col bg-white">
      
      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-[70vh] md:h-[90vh] text-white overflow-hidden bg-slate-900">
        <Carousel setApi={setApi} opts={{ loop: true }} plugins={[autoplayPlugin.current]} className="absolute inset-0 w-full h-full">
          <CarouselContent className='h-full m-0'>
            {isLoading ? (
              <CarouselItem className='p-0'><Skeleton className="w-full h-full bg-slate-800" /></CarouselItem>
            ) : data.heroImages.length > 0 ? (
                data.heroImages.map((img: any) => (
                  <CarouselItem key={img.id} className='h-full p-0'>
                    <div className="relative w-full h-full">
                      <img 
                        src={getImageUrl(img.image || img.imageUrl, 'hero')} 
                        alt="NGO Banner" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/50" />
                    </div>
                  </CarouselItem>
                ))
            ) : (
                <CarouselItem className='p-0'>
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-slate-950" />
                </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
        
        <div className="relative z-10 flex flex-col h-full items-center justify-center text-center px-4 md:px-6 max-w-5xl mx-auto">
            <AnimatedText el="h1" text={t('hero_name')} className="font-headline text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter" />
            <AnimatedText el="p" text={t('hero_titles')} className="mt-4 md:mt-6 text-base md:text-xl text-gray-100 font-medium max-w-3xl" />
            <StaggerWrap className="mt-8 md:mt-12 w-full sm:w-auto">
                <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-white hover:text-emerald-600 rounded-full px-10 h-14 font-bold shadow-2xl transition-all">
                  <Link href="/contact">{t('hero_cta_support')}</Link>
                </Button>
            </StaggerWrap>
        </div>
      </section>

      {/* --- IMAGE MARQUEE SECTION (LEFT TO RIGHT) --- */}
      {!isLoading && data.gallery.length > 0 && (
        <div className="py-12 bg-white overflow-hidden border-y border-slate-50">
          <div className="flex items-center mb-8 px-6">
             <div className="h-px flex-1 bg-slate-100" />
             <span className="mx-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Captured Moments</span>
             <div className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="flex relative">
            <motion.div
              animate={{
                x: ["-50%", "0%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
              className="flex gap-6 px-3"
            >
              {[...data.gallery, ...data.gallery, ...data.gallery, ...data.gallery].map((item: any, i) => {
                const displayImage = parseImageField(item.image);
                return (
                  <div 
                    key={i} 
                    className="w-72 md:w-[450px] h-48 md:h-[300px] rounded-[2rem] overflow-hidden flex-shrink-0 shadow-lg hover:shadow-2xl transition-all duration-500 group relative cursor-pointer"
                    onClick={() => setActiveImage(getImageUrl(displayImage, "gallery"))}
                  >
                    <img 
                      src={getImageUrl(displayImage, "gallery")} 
                      alt="Gallery" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                       <span className="text-white font-black uppercase text-xs tracking-widest">{item.title}</span>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </div>
      )}

      <UpcomingEvents />
      
      {/* --- INITIATIVES SECTION --- */}
      <section className="bg-[#F9FAFB] py-16 md:py-32 relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-50 rounded-full blur-[80px] md:blur-[120px] opacity-40 -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-50 rounded-full blur-[80px] md:blur-[120px] opacity-40 -z-10 -translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 md:mb-16 gap-8 md:gap-10">
            <div className="space-y-4 md:space-y-6 max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <Zap className="h-3 w-3" />
                {language === 'hi' ? 'संचालन इकाइयाँ / लाइव' : 'Operational Units / Live'}
              </motion.div>
              
              <div className="space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[0.95]"
                >
                  {language === 'hi' ? 'हमारी पहल' : 'Our Initiatives.'}
                </motion.h2>
              </div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl"
              >
                {language === 'hi' 
                  ? 'वैश्विक प्रभाव और प्रणालीगत बुनियादी ढांचे के विकास के लिए डिज़ाइन किए गए उन्नत मॉड्यूलर सिस्टम तैनात करना।'
                  : 'Deploying advanced modular systems designed for global impact and systemic infrastructure development.'}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="w-full lg:w-auto"
            >
              <Button asChild className="w-full lg:w-auto rounded-2xl h-16 px-10 bg-slate-900 hover:bg-emerald-600 text-white shadow-xl shadow-slate-200 hover:shadow-emerald-200 transition-all duration-500 font-bold group">
                <Link href="/initiatives" className="flex items-center justify-center gap-3">
                  {language === 'hi' ? 'सभी मिशन देखें' : 'Explore All Missions'}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-20">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                transition={{ 
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="bg-white/60 backdrop-blur-md border border-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm flex flex-col sm:flex-row items-center gap-3 md:gap-4 group hover:bg-white transition-all duration-500 cursor-default text-center sm:text-left"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">{stat.value}</div>
                  <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-10 md:mb-12">
            {['All', 'Social', 'Education', 'Agriculture'].map((cat, idx) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + (idx * 0.05) }}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300",
                  filter === cat 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                    : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
                )}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => <NewsSkeleton key={i} />)
              : (
                <AnimatePresence mode='popLayout'>
                  {filteredInitiatives.slice(0, 6).map((item: any, index: number) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <div className="group relative bg-white rounded-[2.5rem] md:rounded-[3rem] p-3 md:p-4 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(16,185,129,0.12)] flex flex-col h-full overflow-hidden">
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-500/20 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-700 -z-10" />
                        <div className="relative aspect-[4/3] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden mb-6 md:mb-8">
                          <img 
                            src={getImageUrl(item.image, 'initiatives')} 
                            alt={item.titleEn} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                          <div className="absolute top-4 md:top-6 right-4 md:right-6">
                            <Badge className="bg-white/20 backdrop-blur-xl border border-white/30 text-white px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-2xl">
                              {language === 'hi' ? 'सक्रिय' : 'Active Now'}
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                            {initiativeIcons[item.slug] || initiativeIcons.default}
                          </div>
                          {index === 0 && (
                            <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-emerald-500 text-white px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg">
                              Featured
                            </div>
                          )}
                        </div>
                        <div className="px-2 md:px-4 pb-4 md:pb-6 flex flex-col flex-grow">
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="h-[2px] w-8 bg-emerald-500 rounded-full" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600">Strategic Node</span>
                          </div>
                          <h3 className="text-xl md:text-3xl font-black text-slate-900 mb-3 md:mb-4 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                            {language === 'hi' ? item.titleHi : item.titleEn}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed mb-6 md:mb-8 line-clamp-3 font-medium flex-grow">
                            {language === 'hi' ? (item.descriptionHi || item.descriptionEn) : item.descriptionEn}
                          </p>
                          <div className="pt-4 md:pt-6 border-t border-slate-100">
                            <Link 
                              href={`/initiatives/${item.slug}`} 
                              className="inline-flex items-center gap-3 text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] group/link"
                            >
                              {language === 'hi' ? 'प्रभाव देखें' : 'Discover Impact'}
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-all duration-300 group-hover/link:bg-emerald-600 group-hover/link:text-white">
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
          </div>
        </div>
      </section>

      {/* --- INSIGHTS SECTION (Our Insides) --- */}
      <section className="bg-[#f0fdf4] py-16 md:py-32 overflow-hidden selection:bg-emerald-100 font-sans">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-12 md:mb-16 space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black tracking-tight text-slate-900"
            >
              Our Insides
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-slate-500 font-medium max-w-2xl leading-relaxed"
            >
              Read our latest activities, success stories, and awareness articles from our NGO in Lucknow.
            </motion.p>
          </div>

          <div className="grid gap-6 md:gap-8 lg:grid-cols-12">
            {/* LEFT SIDE: Featured Card */}
            <div className="lg:col-span-7">
              {isLoading ? (
                <div className="h-full bg-white rounded-[2rem] animate-pulse min-h-[300px] md:min-h-[400px]" />
              ) : data.articles[0] ? (() => {
                const article = data.articles[0] as any;
                const displayImage = parseImageField(article.images || article.image || article.imageUrl);
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="h-full"
                  >
                    <Link href={`/news/${article.id}`} className="group block h-full">
                      <div className="h-full bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row">
                        <div className="md:w-1/2 h-56 md:h-auto relative overflow-hidden">
                          <img 
                            src={getImageUrl(displayImage, 'news')} 
                            alt={article.titleEn} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        </div>
                        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center space-y-4">
                          <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest w-fit">
                            {article.category || 'Environment'}
                          </Badge>
                          <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                            {language === 'hi' ? article.titleHi : article.titleEn}
                          </h3>
                          <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-3 font-medium">
                            {language === 'hi' ? article.contentHi : article.contentEn}
                          </p>
                          <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                            Read More <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })() : null}
            </div>

            {/* RIGHT SIDE: Small Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
              {isLoading ? (
                <>
                  <div className="h-32 md:h-40 bg-white rounded-[2rem] animate-pulse" />
                  <div className="h-32 md:h-40 bg-white rounded-[2rem] animate-pulse" />
                </>
              ) : data.articles.slice(1, 3).map((article: any, idx: number) => {
                const displayImage = parseImageField(article.images || article.image || article.imageUrl);
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * (idx + 1) }}
                  >
                    <Link href={`/news/${article.id}`} className="group block">
                      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex h-32 md:h-40">
                        <div className="w-1/3 relative overflow-hidden">
                          <img 
                            src={getImageUrl(displayImage, 'news')} 
                            alt={article.titleEn} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        </div>
                        <div className="w-2/3 p-4 md:p-6 flex flex-col justify-center space-y-2">
                          <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest w-fit">
                            {article.category || (idx === 0 ? 'Animal Welfare' : 'Social Welfare')}
                          </Badge>
                          <h3 className="text-sm md:text-lg font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                            {language === 'hi' ? article.titleHi : article.titleEn}
                          </h3>
                          <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[8px] md:text-[9px] tracking-widest group-hover:gap-3 transition-all pt-1">
                            Read More <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-16 flex justify-center"
          >
            <Button asChild className="w-full sm:w-auto rounded-full h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200 transition-all duration-500 font-bold group">
              <Link href="/news" className="flex items-center justify-center gap-3">
                View All Insides
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* --- GALLERY SECTION (Moments That Matter) --- */}
      <section className="bg-white py-16 md:py-32 relative overflow-hidden font-sans">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          
          <div className="flex flex-col items-center text-center mb-12 md:mb-20 space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              {language === 'hi' ? 'हमारी गैलरी' : 'OUR GALLERY'}
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 leading-[0.95]"
            >
              {language === 'hi' ? 'महत्वपूर्ण क्षण' : 'Moments That Matter'}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl"
            >
              {language === 'hi' 
                ? 'वास्तविक प्रभाव, वास्तविक कहानियाँ और वास्तविक परिवर्तन को कैद करना।'
                : 'Capturing real impact, real stories, real change through our lens.'}
            </motion.p>
          </div>

          {isLoading ? <GallerySkeleton /> : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
              {data.gallery.slice(0, 6).map((item: any, i: number) => {
                const displayImage = parseImageField(item.image);
                const title = language === 'hi' ? (item.titleHi || item.title) : item.title;
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    onClick={() => setActiveImage(getImageUrl(displayImage, "gallery"))}
                    className="group relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer break-inside-avoid border border-slate-100 bg-slate-50 shadow-sm hover:shadow-2xl transition-all duration-700"
                  >
                    <img 
                      src={getImageUrl(displayImage, "gallery")} 
                      alt={title}
                      className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col justify-end p-6 md:p-10">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h4 className="text-white text-xl md:text-2xl font-black mb-3 md:mb-4 leading-tight uppercase italic tracking-tighter">
                          {title}
                        </h4>
                        <div className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest">
                           View Story <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-20 flex justify-center"
          >
            <Button asChild className="w-full sm:w-auto rounded-full h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200 transition-all duration-500 font-bold text-lg group">
              <Link href="/gallery" className="flex items-center justify-center gap-3">
                {language === 'hi' ? 'पूरी गैलरी देखें' : 'View Full Gallery'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* LIGHTBOX MODAL */}
        <Dialog open={!!activeImage} onOpenChange={() => setActiveImage(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-slate-950/90 backdrop-blur-2xl overflow-hidden rounded-[2rem]">
            <DialogTitle className="sr-only">Impact Visual</DialogTitle>
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img 
                src={activeImage || ""} 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" 
                alt="Impact Visual" 
              />
              <button 
                onClick={() => setActiveImage(null)} 
                className="absolute top-4 md:top-6 right-4 md:right-6 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
