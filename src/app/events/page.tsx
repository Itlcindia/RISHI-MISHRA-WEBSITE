'use client';

import { useTranslation } from '@/hooks/use-translation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React, { useEffect, useState, useMemo } from 'react';
import { StaggerWrap, StaggerItem } from '@/components/animations';
import AnimatedText from '@/components/animated-text';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, ImageIcon, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { enUS, hi } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const bannerImage = PlaceHolderImages.find(p => p.id === 'gallery-1');
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EventsPage() {
  const { t, language } = useTranslation();
  const locale = language === 'hi' ? hi : enUS;

  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<any>(null);

  // 1. Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/events`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setAllEvents(data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // 2. Optimized Search Logic
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = event.eventName?.toLowerCase().includes(searchLower);
      const locationMatch = event.location?.toLowerCase().includes(searchLower);
      return nameMatch || locationMatch;
    });
  }, [searchQuery, allEvents]);

  return (
    <div className="bg-background min-h-screen pb-20 selection:bg-primary/10">
      
      {/* Banner Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-28 md:py-40 mb-12"
        style={{ backgroundImage: bannerImage ? `url(${bannerImage.imageUrl})` : 'none' }}
      >
        <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
        <div className="relative container mx-auto px-4 text-center text-primary-foreground">
          <StaggerItem>
            <AnimatedText
              el="h1"
              text={language === 'hi' ? 'आगामी कार्यक्रम' : 'Upcoming Events'}
              className="font-headline text-5xl md:text-8xl font-black tracking-tighter"
            />
            <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-primary-foreground/80 font-medium">
              {language === 'hi' 
                ? 'हमारे समुदाय के नवीनतम कार्यक्रमों और समारोहों से जुड़ें।' 
                : 'Empowering communities through purposeful gatherings and shared missions.'}
            </p>
          </StaggerItem>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6">
        
        {/* Search Bar - Floating UI */}
        <div className="relative max-w-2xl mx-auto mb-16 -mt-24 z-20">
          <div className="bg-card p-3 rounded-[2rem] shadow-2xl border border-accent/20 backdrop-blur-xl flex items-center group focus-within:ring-4 ring-primary/20 transition-all">
            <Search className="ml-4 h-6 w-6 text-primary/50 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder={language === 'hi' ? "नाम या स्थान से खोजें..." : "Search by event name or location..."}
              className="border-none focus-visible:ring-0 text-lg bg-transparent placeholder:text-muted-foreground/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* State Handling */}
        {isLoading ? (
          <StaggerWrap className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({length: 6}).map((_, i) => <EventSkeleton key={i} />)}
          </StaggerWrap>
        ) : error ? (
          <div className="text-center py-20 px-6 bg-destructive/5 rounded-[3rem] border-2 border-dashed border-destructive/20 max-w-4xl mx-auto">
            <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
               <Info className="text-destructive" size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-destructive">Connection Lost</h3>
            <p className="text-muted-foreground mt-2 font-medium italic">Unable to reach the server at {API_BASE_URL}</p>
            <Button variant="outline" className="mt-8 rounded-full px-8" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredEvents.length > 0 ? (
          <StaggerWrap className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const imageUrl = event.image ? `${API_BASE_URL}/uploads/events/${event.image}` : null;
              const displayDate = event.date ? format(parseISO(event.date), 'MMMM dd, yyyy', { locale }) : 'To be announced';

              return (
                <StaggerItem key={event.id || event._id}>
                  <Card className="flex h-full flex-col overflow-hidden bg-card hover:bg-accent/5 border-accent/10 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] group rounded-[2.5rem]">
                    
                    {/* Event Image & Badge */}
                    <div className="relative h-64 w-full overflow-hidden bg-muted">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={event.eventName} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-primary/5 text-primary/20">
                          <ImageIcon className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full shadow-xl text-[10px] font-black uppercase tracking-widest">
                          {event.type || 'Community'}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        <Calendar className="h-3.5 w-3.5" />
                        {displayDate}
                      </div>
                      <CardTitle className="font-headline text-2xl md:text-3xl font-black leading-none group-hover:text-primary transition-colors line-clamp-2">
                         {event.eventName}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="px-8 flex-grow">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground/80 font-medium mb-6">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span className="line-clamp-1">{event.location || 'Online/TBA'}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed italic">
                        {language === 'hi' ? event.descriptionHi : (event.descriptionEn || event.descriptionHi)}
                      </p>
                    </CardContent>
                    
                    <CardFooter className="p-8 pt-0">
                      <Button className="w-full rounded-2xl h-14 bg-slate-900 hover:bg-primary text-white transition-all font-black uppercase tracking-widest text-xs" asChild>
                        <Link href={`/events/${event.id || event._id}`}>
                          {language === 'hi' ? 'पूरा विवरण' : 'Full Details'}
                          <span className="ml-2 transition-transform group-hover:translate-x-2">→</span>
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerWrap>
        ) : (
          <div className="text-center py-32 border-4 border-dashed rounded-[4rem] border-primary/5">
            <Search className="mx-auto h-16 w-16 text-primary/10 mb-6" />
            <p className="text-3xl font-black tracking-tighter uppercase italic text-primary/20">No matching events found</p>
            <Button variant="link" className="mt-4 text-primary font-bold" onClick={() => setSearchQuery('')}>Clear Search</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Badge Component
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors ${className}`}>
      {children}
    </span>
  );
}

const EventSkeleton = () => (
    <Card className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border-none bg-muted/50">
        <Skeleton className="h-64 w-full" />
        <div className="p-8 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-14 w-full mt-4 rounded-2xl" />
        </div>
    </Card>
);