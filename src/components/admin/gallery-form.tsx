'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Upload, X, Loader2, History, Tag, Languages } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Schema updated to match your Table columns
const galleryFormSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  titleHi: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

interface GalleryFormProps {
  galleryImage?: any | null; 
  onSave: (formData: FormData) => Promise<void>;
}

export function GalleryForm({ galleryImage, onSave }: GalleryFormProps) {
  const isEditing = !!galleryImage;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: galleryImage?.title || '',
      titleHi: galleryImage?.titleHi || '',
      category: galleryImage?.category || 'General',
    },
  });

  useEffect(() => {
    if (isEditing && galleryImage.image) {
      try {
        const imgs = typeof galleryImage.image === 'string' 
          ? JSON.parse(galleryImage.image) 
          : galleryImage.image;
        setExistingImages(Array.isArray(imgs) ? imgs : [imgs]);
      } catch (e) {
        setExistingImages([]);
      }
    }
  }, [galleryImage, isEditing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const combinedFiles = [...selectedFiles, ...files].slice(0, 10);
      setSelectedFiles(combinedFiles);
      const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeNewFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    URL.revokeObjectURL(previews[index]);
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const removeExistingFile = (imgName: string) => {
    setExistingImages(prev => prev.filter(img => img !== imgName));
  };

  const onSubmit = async (values: GalleryFormValues) => {
    if (selectedFiles.length === 0 && existingImages.length === 0) {
      alert("Gallery cannot be empty!");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('titleHi', values.titleHi || '');
      formData.append('category', values.category);
      
      // Backend expects 'existingImages' to know which files to keep
      formData.append('existingImages', JSON.stringify(existingImages));
      
      // Field name MUST be 'gallery' to match backend upload.array('gallery')
      selectedFiles.forEach((file) => {
        formData.append('gallery', file);
      });
      
      await onSave(formData);
      if(!isEditing) {
        setSelectedFiles([]);
        setPreviews([]);
        form.reset();
      }
    } catch (error) {
      console.error("Gallery Sync Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* IMAGE UPLOAD SECTION */}
          <div className="space-y-4">
            <Label className="font-black uppercase text-[10px] tracking-widest text-slate-400 flex items-center gap-2">
              <Upload size={14} /> Assets Stack ({existingImages.length + selectedFiles.length}/10)
            </Label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <label className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer bg-slate-50 group">
                <Upload className="h-6 w-6 text-primary group-hover:-translate-y-1 transition-transform" />
                <span className="text-[9px] font-black uppercase mt-2">Upload</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
              </label>

              {existingImages.map((img, idx) => (
                <div key={`old-${idx}`} className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-sm group">
                  <img src={`${API_BASE_URL}/uploads/gallery/${img}`} className="w-full h-full object-cover" alt="Stored" />
                  <button type="button" onClick={() => removeExistingFile(img)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-[7px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Saved</div>
                </div>
              ))}

              {previews.map((url, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-primary/20 shadow-sm group">
                  <img src={url} className="w-full h-full object-cover" alt="New" />
                  <button type="button" onClick={() => removeNewFile(index)} className="absolute top-2 right-2 bg-primary text-white p-1.5 rounded-full">
                    <X size={10} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-primary text-[7px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">New</div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* META DATA SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black uppercase text-[10px] tracking-widest text-slate-400">Title (English)</FormLabel>
                  <FormControl>
                    <Input className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all" placeholder="Annual Impact 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="titleHi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black uppercase text-[10px] tracking-widest text-slate-400 flex items-center gap-2">
                    <Languages size={12} /> Title (Hindi)
                  </FormLabel>
                  <FormControl>
                    <Input className="h-12 rounded-xl bg-slate-50/50 border-slate-200" placeholder="वार्षिक प्रभाव २०२४" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black uppercase text-[10px] tracking-widest text-slate-400 flex items-center gap-2">
                    <Tag size={12} /> Category
                  </FormLabel>
                  <FormControl>
                    <Input className="h-12 rounded-xl bg-slate-50/50 border-slate-200" placeholder="Education / Health / Events" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100">
              <History className="text-primary h-4 w-4 mt-0.5" />
              <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                Note: Deleting 'Saved' images here will permanently remove them from the server once you click sync.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className="h-14 w-full md:w-auto md:min-w-[280px] rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : (isEditing ? 'Update Collection' : 'Launch Batch')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}