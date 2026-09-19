'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';
import { ImageIcon, UploadCloud, X, Loader2, Languages, Save, CalendarDays } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Updated Schema with publishDate
const newsFormSchema = z.object({
  titleEn: z.string().min(5, 'English title must be at least 5 characters.'),
  titleHi: z.string().min(5, 'Hindi title is required.'),
  contentEn: z.string().min(20, 'English content is too short.'),
  contentHi: z.string().min(20, 'Hindi content is too short.'),
  category: z.string().min(1, 'Please select a category'),
  publishDate: z.string().min(1, 'Publish date is required'),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

interface NewsItem {
  id?: number | string;
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
  images?: string | string[]; // Backend se JSON string ya array aa sakta hai
  category?: string;
  publishDate?: string;
}

interface NewsFormProps {
  article?: NewsItem | null;
  onSave: (formData: FormData) => void;
  isSaving?: boolean;
}

export function NewsForm({ article, onSave, isSaving = false }: NewsFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      titleEn: article?.titleEn || '',
      titleHi: article?.titleHi || '',
      contentEn: article?.contentEn || '',
      contentHi: article?.contentHi || '',
      category: article?.category || 'General',
      publishDate: article?.publishDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    },
  });

  // Sync logic for Multiple Images
  useEffect(() => {
    if (article) {
      form.reset({
        titleEn: article.titleEn,
        titleHi: article.titleHi,
        contentEn: article.contentEn,
        contentHi: article.contentHi,
        category: article.category || 'General',
        publishDate: article.publishDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      });

      if (article.images) {
        const imageArray = typeof article.images === 'string' ? JSON.parse(article.images) : article.images;
        const urls = imageArray.map((img: string) => `${API_BASE_URL}/uploads/news/${img}`);
        setPreviewUrls(urls);
      }
    }
  }, [article, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...previewUrls];
    const newFiles = [...selectedFiles];
    
    // Revoke blob URL to save memory if it's a new upload
    if (newPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    
    newPreviews.splice(index, 1);
    // Note: This logic assumes new files are added to the end. 
    // For a precise edit, you'd track which previews are new vs old.
    setPreviewUrls(newPreviews);
  };

  const onSubmit = (values: NewsFormValues) => {
    const formData = new FormData();
    formData.append('titleEn', values.titleEn);
    formData.append('titleHi', values.titleHi);
    formData.append('contentEn', values.contentEn);
    formData.append('contentHi', values.contentHi);
    formData.append('category', values.category);
    formData.append('publishDate', values.publishDate);
    
    selectedFiles.forEach((file) => {
      formData.append('news', file); // 'news' key matches your backend upload.array('news')
    });
    
    onSave(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Header: Section & Date Tool */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-200 gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/30">
                    <Languages className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-black uppercase italic tracking-tighter text-lg leading-none">Bilingual News Engine</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Asset & Scheduled Publishing</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                {/* Date Tool */}
                <FormField control={form.control} name="publishDate" render={({ field }) => (
                    <FormItem className="space-y-0">
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <FormControl>
                              <Input type="date" {...field} className="pl-10 w-[180px] h-12 rounded-xl font-bold border-slate-200 shadow-sm" />
                          </FormControl>
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* Category Tool */}
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem className="space-y-0">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="w-[180px] h-12 rounded-xl shadow-sm bg-white border-slate-200 font-bold uppercase text-[10px] tracking-widest">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                                <SelectItem value="General" className="font-bold uppercase text-[10px]">General News</SelectItem>
                                <SelectItem value="Upcoming Event" className="font-bold uppercase text-[10px]">Upcoming Event</SelectItem>
                                <SelectItem value="Press Release" className="font-bold uppercase text-[10px]">Press Release</SelectItem>
                                <SelectItem value="Urgent Alert" className="font-bold uppercase text-[10px]">Urgent Alert</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
            </div>
        </div>

        {/* Editors: English & Hindi */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-5 p-7 rounded-[2.5rem] border bg-white shadow-sm border-slate-100">
            <Badge variant="secondary" className="px-4 py-1 rounded-full font-black uppercase tracking-widest text-[9px]">English Feed</Badge>
            <FormField control={form.control} name="titleEn" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-500 uppercase text-[10px]">Headline (EN)</FormLabel>
                <FormControl><Input className="h-14 rounded-2xl bg-slate-50/50 border-slate-100" placeholder="Article Headline..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contentEn" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-500 uppercase text-[10px]">Body Content (EN)</FormLabel>
                <FormControl><Textarea rows={12} className="rounded-[2rem] resize-none p-5 bg-slate-50/50 border-slate-100" placeholder="Full article..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-5 p-7 rounded-[2.5rem] border bg-primary/[0.02] border-primary/10 shadow-sm shadow-primary/5">
            <Badge className="px-4 py-1 rounded-full font-black uppercase tracking-widest text-[9px] bg-primary">हिंदी फीड</Badge>
            <FormField control={form.control} name="titleHi" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-primary uppercase text-[10px]">मुख्य शीर्षक (HI)</FormLabel>
                <FormControl><Input className="h-14 rounded-2xl border-primary/10 font-hindi text-xl" placeholder="खबर की सुर्खी..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contentHi" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-primary uppercase text-[10px]">समाचार विवरण (HI)</FormLabel>
                <FormControl><Textarea rows={12} className="rounded-[2rem] resize-none font-hindi text-xl p-5 border-primary/10 bg-white" placeholder="पूरा विवरण यहाँ लिखें..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* Multi-Media Gallery Zone */}
        <div className="p-10 border-4 border-dashed rounded-[3rem] bg-slate-950 text-white shadow-3xl">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-1/3 space-y-6">
                <div>
                  <h4 className="font-black uppercase italic tracking-tighter text-3xl text-primary">Media Gallery</h4>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed mt-2 uppercase tracking-tighter">Upload multiple assets. The first image will be used as the primary cover across the platform.</p>
                </div>
                
                <label className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-slate-800 rounded-[2rem] cursor-pointer hover:border-primary hover:bg-white/5 transition-all group border-dashed">
                    <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all shadow-2xl">
                        <UploadCloud className="h-8 w-8 text-primary group-hover:text-white" />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-black uppercase tracking-widest">Select Files</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">PNG, JPG up to 10MB</span>
                    </div>
                    <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
            </div>
            
            <div className="lg:w-2/3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[200px]">
                    {previewUrls.length > 0 ? (
                      previewUrls.map((url, index) => (
                        <div key={index} className="aspect-square relative rounded-[1.5rem] overflow-hidden border-2 border-slate-800 group bg-slate-900 shadow-2xl">
                          <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Preview ${index}`} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button type="button" size="icon" variant="destructive" className="h-10 w-10 rounded-xl" onClick={() => removeImage(index)}>
                                <X className="h-5 w-5 stroke-[3px]"/>
                            </Button>
                          </div>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-[8px] font-black uppercase rounded-md shadow-lg">Primary</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center border-2 border-slate-900 rounded-[2rem] bg-slate-900/50 italic text-slate-700 font-bold">
                        <ImageIcon size={48} className="mb-2 opacity-20" />
                        <p className="text-[10px] uppercase tracking-widest">No Media Uploaded</p>
                      </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        <Button 
          disabled={isSaving} 
          type="submit" 
          className="w-full h-24 rounded-[2.5rem] text-2xl font-black uppercase italic tracking-[0.1em] shadow-2xl shadow-primary/40 transition-all hover:scale-[1.01] active:scale-95 bg-primary hover:bg-primary/90"
        >
          {isSaving ? <Loader2 className="animate-spin h-8 w-8 mr-4" /> : <Save className="h-8 w-8 mr-4 stroke-[3px]" />}
          {article ? 'Commit Updates' : 'Publish to Feed'}
        </Button>
      </form>
    </Form>
  );
}
