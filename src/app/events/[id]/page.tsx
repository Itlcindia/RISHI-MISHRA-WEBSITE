import React from 'react';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, ArrowLeft, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, parseISO, isValid } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getEvent(id: string) {
  try {
    // Next.js cache control: 'no-store' ensures fresh data from DB
    const res = await fetch(`${API_BASE_URL}/api/events/${id}`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Fetch error details:", error);
    return null;
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);

  // 1. Check if event exists
  if (!event || !event.eventName) {
    return notFound();
  }

  // 2. Safe Date Parsing
  const dateObj = parseISO(event.date);
  const formattedDate = isValid(dateObj) ? format(dateObj, 'PPPP') : 'Date TBA';

  const imageUrl = event.image 
    ? `${API_BASE_URL}/uploads/events/${event.image}` 
    : null;

  return (
    <main className="min-h-screen bg-background pb-20 selection:bg-primary/20">
      {/* Hero Header Section */}
      <div className="relative h-[50vh] w-full overflow-hidden bg-slate-950">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={event.eventName} 
            className="w-full h-full object-cover opacity-50 transition-transform duration-1000 hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-slate-900" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="absolute bottom-10 container mx-auto px-6">
          <Link 
            href="/events" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-primary transition-colors mb-6 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter max-w-4xl leading-[0.9]">
            {event.eventName}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        {/* Left Content: Description */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-8 md:p-12 rounded-[3rem] border shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-3 mb-6">
                <Globe className="text-primary h-5 w-5" />
                <h2 className="text-xl font-black uppercase tracking-widest">About the Event</h2>
            </div>
            
            <div className="space-y-8">
                {/* Hindi Description */}
                <div className="space-y-3">
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">Hindi</span>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg md:text-xl font-medium">
                        {event.descriptionHi}
                    </p>
                </div>

                {/* English Description (Optional check) */}
                {event.descriptionEn && (
                    <div className="space-y-3 pt-6 border-t border-dashed">
                        <span className="text-[10px] font-bold bg-muted text-muted-foreground px-3 py-1 rounded-full uppercase">English</span>
                        <p className="text-muted-foreground/80 leading-relaxed whitespace-pre-wrap text-lg italic">
                            {event.descriptionEn}
                        </p>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Details Card */}
        <aside className="">
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] sticky top-24 shadow-2xl border border-white/5">
            <h3 className="text-2xl font-black mb-8 border-b border-white/10 pb-4 tracking-tighter">Event Info</h3>
            
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="bg-white/10 p-3 rounded-2xl">
                    <Calendar className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase font-bold tracking-widest">When</p>
                  <p className="font-bold text-lg">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-white/10 p-3 rounded-2xl">
                    <MapPin className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase font-bold tracking-widest">Where</p>
                  <p className="font-bold text-lg leading-snug">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-white/10 p-3 rounded-2xl">
                    <Clock className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase font-bold tracking-widest">Status</p>
                  <p className="font-bold text-lg">Open for Registration</p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-10 rounded-[1.5rem] py-8 font-black text-xl uppercase tracking-tighter bg-primary hover:bg-white hover:text-black transition-all shadow-xl shadow-primary/20">
              Register Now
            </Button>
            
            <p className="text-center text-[10px] text-white/30 mt-6 font-medium">
                * Please carry a valid ID proof to the venue.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}