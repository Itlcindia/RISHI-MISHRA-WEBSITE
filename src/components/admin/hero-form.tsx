'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { ImageIcon, Save, Loader2, UploadCloud } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const heroFormSchema = z.object({
  subtitle: z.string().min(5, 'Description must be at least 5 characters'),
  display_order: z.coerce.number().min(0, 'Order cannot be negative'),
});

type HeroFormValues = z.infer<typeof heroFormSchema>;

interface HeroItem {
  id?: number;
  imageUrl?: string;
  description: string;
  display_order: number;
}

interface HeroFormProps {
  heroImage?: HeroItem | null;
  onSave: (data: FormData) => Promise<void>;
}

export function HeroForm({ heroImage, onSave }: HeroFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      subtitle: '',
      display_order: 0,
    },
  });

  // Sync form when editing an existing item
  useEffect(() => {
    if (heroImage) {
      form.reset({
        subtitle: heroImage.description,
        display_order: heroImage.display_order,
      });
      if (heroImage.imageUrl) {
        setPreviewUrl(`${API_BASE_URL}/uploads/hero/${heroImage.imageUrl}`);
      }
    } else {
      form.reset({ subtitle: '', display_order: 0 });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [heroImage, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (values: HeroFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subtitle', values.subtitle); 
      formData.append('display_order', values.display_order.toString());

      // Important: Send the old image name so the backend can delete it if replaced
      if (heroImage?.imageUrl) {
        formData.append('oldImage', heroImage.imageUrl);
      }

      if (selectedFile) {
        formData.append('hero', selectedFile); 
      }

      await onSave(formData);
    } catch (error) {
      console.error("Hero Save Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Side: Inputs */}
            <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
              <div className="space-y-3">
                <Label className="font-black uppercase text-[10px] tracking-widest text-slate-400 flex items-center gap-2">
                  <UploadCloud size={14} className="text-primary" /> Hero Media Asset
                </Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="rounded-xl bg-white border-slate-200 file:bg-primary file:text-white file:border-none file:px-4 file:mr-4 file:rounded-lg file:font-bold file:cursor-pointer"
                />
              </div>

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-slate-400">Heading / Description</FormLabel>
                    <FormControl>
                      <Input className="rounded-xl h-12 border-slate-200" placeholder="E.g. Empowering Rural Communities" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase text-[10px] tracking-widest text-slate-400">Sequence Order</FormLabel>
                    <FormControl>
                      <Input type="number" className="rounded-xl h-12 border-slate-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Side: Preview */}
            <div className="space-y-4">
              <Label className="font-black uppercase text-[10px] tracking-widest text-slate-400">Live View Preview</Label>
              <div className="relative aspect-video border-4 border-white shadow-2xl rounded-[2.5rem] flex items-center justify-center bg-slate-900 overflow-hidden group">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Hero Preview" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <p className="text-white font-black italic uppercase tracking-tighter text-lg leading-tight">
                            {form.watch('subtitle') || 'Hero Caption Preview'}
                        </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2 opacity-20">
                    <ImageIcon className="h-12 w-12 mx-auto text-white" />
                    <p className="text-white font-black text-[10px] uppercase tracking-widest">No Asset Loaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-6">
            <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="h-14 px-10 rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5 stroke-[3px]" />
                  {heroImage ? 'Update Hero Slide' : 'Launch New Slide'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}