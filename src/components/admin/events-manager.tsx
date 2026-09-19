'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO, isValid } from 'date-fns';
import { enUS, hi } from 'date-fns/locale';
import { useTranslation } from '@/hooks/use-translation';
import { Calendar, MapPin, Edit, Trash2, Plus, Loader2, ImageIcon } from 'lucide-react';

// Environment variable use karein hardcoded URL ki jagah
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface EventItem {
  id: number;
  eventName: string;
  location: string;
  date: string;
  image?: string;
}

interface EventsManagerProps {
  events: EventItem[] | null;
  isLoading?: boolean;
  error?: any; 
  onAddNew?: () => void;
  onEdit: (event: EventItem) => void;
  onRefresh: () => void;
}

export function EventsManager({ 
  events = [], 
  isLoading, 
  error, 
  onAddNew, 
  onEdit, 
  onRefresh 
}: EventsManagerProps) {
  const { toast } = useToast();
  const { language } = useTranslation();
  
  // Set locale based on current language
  const currentLocale = language === 'hi' ? hi : enUS;
  
  const handleDelete = async (eventId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({ 
          title: language === 'hi' ? 'कार्यक्रम हटाया गया' : 'Event Removed', 
          description: language === 'hi' ? 'रिकॉर्ड हटा दिया गया है।' : 'The event record has been deleted.' 
        });
        onRefresh();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Server connection failed.',
        variant: 'destructive'
      });
    }
  };

  const formatDateSafely = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    
    // Hindi/English ke according date format
    return format(date, 'PPP', { locale: currentLocale });
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 text-muted-foreground bg-white/50 backdrop-blur-sm rounded-[2rem] border border-dashed">
      <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
      <p className="font-black italic uppercase tracking-widest text-[10px]">Updating Database...</p>
    </div>
  );

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between px-0 pb-8 gap-4">
        <div>
          <CardTitle className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Calendar className="h-10 w-10 text-primary" />
            {language === 'hi' ? 'कार्यक्रम सूची' : 'Events Schedule'}
          </CardTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            {language === 'hi' ? 'NGO कार्यक्रमों और बैठकों का प्रबंधन करें' : 'Manage NGO programs & community meetings'}
          </p>
        </div>
        <Button onClick={onAddNew} className="rounded-2xl h-14 px-8 font-black uppercase italic tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">
          <Plus className="mr-2 h-5 w-5 stroke-[3px]" /> 
          {language === 'hi' ? 'नया जोड़ें' : 'Create Event'}
        </Button>
      </CardHeader>

      <CardContent className="px-0">
        <div className="rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-200/50">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[120px] font-black uppercase text-[10px] tracking-widest text-slate-400 py-6 pl-10">Preview</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Event Details</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Schedule</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-slate-400 pr-10">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events && events.length > 0 ? (
                events.map((event) => (
                  <TableRow key={event.id} className="group hover:bg-slate-50/30 transition-colors border-slate-50">
                    <TableCell className="pl-10 py-5">
                      <div className="h-16 w-16 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100 ring-1 ring-slate-100">
                        {event.image ? (
                          <img 
                            src={`${API_BASE_URL}/uploads/events/${event.image}`} 
                            alt="event" 
                            className="h-full w-full object-cover group-hover:scale-125 transition-transform duration-700"
                            onError={(e) => {(e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=No+Media'}}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center opacity-20">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase italic tracking-tight text-base">{event.eventName}</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase mt-1 tracking-wider">
                          <MapPin className="h-3 w-3 fill-primary/10" />
                          {event.location}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        {formatDateSafely(event.date)}
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-10">
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-11 w-11 rounded-2xl bg-white border border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                          onClick={() => onEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-11 w-11 rounded-2xl bg-white border border-slate-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-red-500 shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription className="font-bold text-slate-500 text-sm">
                                Are you sure you want to remove <span className="text-primary">"{event.eventName}"</span>? This action is irreversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-3 mt-4">
                              <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-200">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(event.id)} 
                                className="bg-red-500 hover:bg-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest"
                              >
                                Delete Forever
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center opacity-10">
                      <Calendar className="h-20 w-20 mb-4" />
                      <p className="font-black text-2xl uppercase italic tracking-tighter">Inbox is Empty</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}