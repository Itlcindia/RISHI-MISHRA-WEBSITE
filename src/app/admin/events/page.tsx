'use client';

import { useState, useEffect, useCallback } from 'react';
// Folder path check karein: components/admin folder hona chahiye
import { EventsManager } from '@/components/admin/events-manager'; 
import { EventForm } from '@/components/admin/event-form'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, RefreshCcw } from 'lucide-react';

// Env URL fallback ke saath
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events`;

export default function AdminEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Memoized fetch function taaki unnecessary re-renders na ho
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Database se events load nahi ho paye.");
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err);
      toast({
        title: "Connection Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    const isEditing = !!selectedEvent;
    const url = isEditing ? `${API_URL}/${selectedEvent.id}` : API_URL;

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: formData, // FormData handles images automatically
      });

      if (res.ok) {
        toast({
          title: isEditing ? "Event Updated" : "Success!",
          description: `Event "${formData.get('title')}" safely saved to MySQL.`,
        });
        setIsModalOpen(false);
        setSelectedEvent(null);
        fetchEvents(); 
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Save operation fail ho gayi.");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto py-10 px-4 space-y-8">
        
        {/* Top Header Section for Events Page */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
              Events <span className="text-primary not-italic">Dashboard</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mt-1">
              Manage NGO schedules and activities
            </p>
          </div>
          <button 
            onClick={fetchEvents}
            disabled={isLoading}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            title="Refresh Data"
          >
            <RefreshCcw className={`h-5 w-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Manager Component */}
        <EventsManager 
          events={events}
          isLoading={isLoading}
          error={error}
          onAddNew={handleAddNewClick}
          onEdit={handleEditClick}
          onRefresh={fetchEvents}
        />

        {/* Create/Edit Dialog */}
        <Dialog 
          open={isModalOpen} 
          onOpenChange={(open) => {
            if (!isSaving) { 
              setIsModalOpen(open);
              if (!open) setSelectedEvent(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-[2rem] shadow-2xl border-none bg-white p-0">
            {/* Custom Dialog Header Styling */}
            <div className="bg-slate-900 p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-xl">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  {selectedEvent ? 'Update' : 'Schedule'} <span className="text-primary">Event</span>
                </DialogTitle>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                  Changes will be instantly reflected in the MySQL database
                </p>
              </DialogHeader>
            </div>
            
            <div className="p-8 relative">
              {isSaving && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="font-bold uppercase tracking-widest text-xs text-slate-600">Uploading Data...</p>
                  </div>
                </div>
              )}

              <EventForm 
                event={selectedEvent} 
                onSave={handleSave} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}