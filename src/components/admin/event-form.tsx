'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  MapPin, 
  ImageIcon, 
  Save, 
  UploadCloud, 
  Loader2,
  Globe,
  Languages
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ================= VALIDATION SCHEMA ================= */
const eventFormSchema = z.object({
  eventName: z.string().min(5, 'Event name kam se kam 5 characters ka hona chahiye'),
  date: z.string().min(1, 'Date zaroori hai'),
  location: z.string().min(3, 'Location zaroori hai'),
  descriptionHi: z.string().min(20, 'Hindi description kam se kam 20 characters ki honi chahiye'),
  descriptionEn: z.string().min(20, 'English description kam se kam 20 characters ki honi chahiye'),
  image: z.any().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventItem {
  id?: number;
  eventName: string;
  date: string | Date;
  location: string;
  descriptionHi: string;
  descriptionEn: string;
  image?: string;
}

interface EventFormProps {
  event?: EventItem | null;
  onSave: (formData: FormData) => Promise<void>;
}

export function EventForm({ event, onSave }: EventFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventName: event?.eventName || '',
      location: event?.location || '',
      descriptionHi: event?.descriptionHi || '',
      descriptionEn: event?.descriptionEn || '',
      date: event?.date ? format(new Date(event.date), 'yyyy-MM-dd') : '',
      image: undefined,
    },
  });

  const selectedFile = form.watch('image');

  useEffect(() => {
    if (selectedFile instanceof File) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (event?.image) {
      setPreviewUrl(`${API_BASE_URL}/uploads/events/${event.image}`);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile, event]);

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('eventName', values.eventName);
      formData.append('location', values.location);
      formData.append('descriptionHi', values.descriptionHi);
      formData.append('descriptionEn', values.descriptionEn);
      
      // MySQL standard: YYYY-MM-DD
      const mysqlDate = format(new Date(values.date), 'yyyy-MM-dd');
      formData.append('date', mysqlDate);

      if (values.image instanceof File) {
        formData.append('image', values.image);
      }

      await onSave(formData);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto p-6 border rounded-[2rem] bg-white shadow-xl shadow-slate-200/50">
        
        <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="text-primary h-6 w-6" />
            </div>
            <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Event Scheduler</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global & Regional Outreach</p>
            </div>
        </div>

        {/* EVENT NAME */}
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-slate-700">Event Title</FormLabel>
              <FormControl>
                <Input className="h-12 rounded-xl focus-visible:ring-primary" placeholder="e.g. Annual Charity Gala 2026" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DATE & LOCATION GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                  <CalendarIcon size={16} className="text-primary" /> Event Date
                </FormLabel>
                <FormControl>
                  <Input type="date" className="h-12 rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                  <MapPin size={16} className="text-primary" /> Venue Location
                </FormLabel>
                <FormControl>
                  <Input className="h-12 rounded-xl" placeholder="City, State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* BILINGUAL DESCRIPTIONS */}
        <div className="grid md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="descriptionEn"
            render={({ field }) => (
                <FormItem className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <FormLabel className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-slate-500 mb-2">
                    <Globe size={14} /> English Content
                </FormLabel>
                <FormControl>
                    <Textarea 
                    rows={6} 
                    className="rounded-xl border-none shadow-inner resize-none bg-white" 
                    placeholder="Details for global audience..." 
                    {...field} 
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="descriptionHi"
            render={({ field }) => (
                <FormItem className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <FormLabel className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-primary mb-2">
                    <Languages size={14} /> हिंदी विवरण
                </FormLabel>
                <FormControl>
                    <Textarea 
                    rows={6} 
                    className="rounded-xl border-none shadow-inner resize-none font-hindi text-lg bg-white" 
                    placeholder="कार्यक्रम का विवरण यहाँ लिखें..." 
                    {...field} 
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {/* IMAGE UPLOAD & PREVIEW */}
        <div className="p-6 border-2 border-dashed rounded-[2rem] bg-slate-900 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange } }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-slate-400 mb-4">
                    <UploadCloud size={16} className="text-primary" /> Cover Asset
                    </FormLabel>
                    <FormControl>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-2xl cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors">
                        <UploadCloud className="h-8 w-8 text-slate-500 mb-2" />
                        <span className="text-xs font-bold text-slate-400">Click to upload image</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files?.[0])}
                        />
                    </label>
                    </FormControl>
                    <FormDescription className="text-slate-500 text-[10px]">
                    Recommended resolution: 1280x720px.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="aspect-video rounded-2xl flex items-center justify-center bg-slate-800 overflow-hidden relative border-4 border-slate-700 shadow-2xl">
                {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                <div className="text-center text-slate-600">
                    <ImageIcon className="mx-auto mb-2 opacity-20" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Asset Loaded</p>
                </div>
                )}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <Button 
          type="submit" 
          className="w-full h-16 rounded-2xl text-xl font-black uppercase italic tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-95" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          ) : (
            <Save className="mr-3 h-6 w-6 stroke-[3px]" />
          )}
          {event ? 'Commit Changes' : 'Launch Event'}
        </Button>
      </form>
    </Form>
  );
}