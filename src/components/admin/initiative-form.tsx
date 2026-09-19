'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { ImageIcon, Save, UploadCloud, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const initiativeFormSchema = z.object({
  titleHi: z.string().min(2, 'Hindi Title is required'),
  titleEn: z.string().min(2, 'English Title is required'),
  descriptionHi: z.string().min(10, 'Hindi description is required'),
  descriptionEn: z.string().min(10, 'English description is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase and hyphenated (e.g., test-slug)'),
  display_order: z.coerce.number().int().nonnegative(),
});

type InitiativeFormValues = z.infer<typeof initiativeFormSchema>;

export function InitiativeForm({ initiative, onSave }: { initiative?: any, onSave: (formData: FormData) => Promise<void> | void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InitiativeFormValues>({
    resolver: zodResolver(initiativeFormSchema),
    defaultValues: {
      titleHi: '',
      titleEn: '',
      descriptionHi: '',
      descriptionEn: '',
      slug: '',
      display_order: 0,
    },
  });

  const watchedTitleEn = form.watch('titleEn');

  // Slug auto-generation logic
  useEffect(() => {
    if (!initiative && watchedTitleEn) {
      const suggestedSlug = watchedTitleEn
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      form.setValue('slug', suggestedSlug, { shouldValidate: true });
    }
  }, [watchedTitleEn, form, initiative]);

  // Initial load / Reset logic
  useEffect(() => {
    if (initiative) {
      form.reset({
        titleHi: initiative.titleHi || '',
        titleEn: initiative.titleEn || '',
        descriptionHi: initiative.descriptionHi || '',
        descriptionEn: initiative.descriptionEn || '',
        slug: initiative.slug || '',
        display_order: initiative.display_order || 0,
      });
      if (initiative.image) {
        setPreviewUrl(`${API_BASE_URL}/uploads/initiatives/${initiative.image}`);
      }
    }
  }, [initiative, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const onSubmit = async (values: InitiativeFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      if (selectedFile) {
        formData.append('initiative_img', selectedFile);
      }
      
      await onSave(formData);
    } catch (err) {
      console.error("Initiative Save Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[85vh] overflow-y-auto px-4 py-2 custom-scrollbar">
        
        {/* Language Split Section */}
        <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="titleHi" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Title (Hindi)</FormLabel>
                <FormControl><Input className="h-12" placeholder="उदा. शिक्षा सहायता" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="titleEn" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Title (English)</FormLabel>
                <FormControl><Input className="h-12" placeholder="e.g. Education Support" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="slug" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">URL Slug</FormLabel>
              <FormControl><Input className="bg-slate-50 font-mono text-sm" placeholder="education-support" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="display_order" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Priority Order</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="space-y-6">
          <FormField control={form.control} name="descriptionHi" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Description (Hindi)</FormLabel>
              <FormControl><Textarea className="min-h-[120px] resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="descriptionEn" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Description (English)</FormLabel>
              <FormControl><Textarea className="min-h-[120px] resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Media Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-900 p-6 rounded-[2rem] text-white">
          <FormItem className="space-y-3">
            <FormLabel className="text-primary font-black uppercase text-[10px] tracking-widest">Featured Image</FormLabel>
            <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 rounded-3xl cursor-pointer hover:border-primary hover:bg-slate-800 transition-all">
              <UploadCloud className="w-8 h-8 mb-2 text-slate-500 group-hover:text-primary transition-colors" />
              <p className="text-[10px] uppercase font-bold tracking-tighter">Click to replace media</p>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </FormItem>

          <div className="h-40 w-full rounded-3xl border-4 border-slate-800 flex items-center justify-center overflow-hidden bg-slate-800 shadow-inner">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-12 w-12 opacity-10" />
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-16 gap-3 rounded-2xl text-lg font-black uppercase italic tracking-widest bg-green-600 hover:bg-green-700 shadow-xl shadow-green-900/20 transition-all active:scale-95"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Save className="h-6 w-6 stroke-[3px]" />
          )}
          {initiative ? 'Update Initiative' : 'Publish to Portal'}
        </Button>
      </form>
    </Form>
  );
}