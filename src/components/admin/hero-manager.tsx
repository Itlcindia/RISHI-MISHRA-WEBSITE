'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Plus, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ✅ MATCHED WITH BACKEND DB SCHEMA
interface HeroImageItem {
  id: number;
  imageUrl: string;
  description: string;
  display_order: number; // Changed from 'order' to 'display_order' to match MySQL
}

interface HeroManagerProps {
  heroImages: HeroImageItem[] | null;
  isLoading: boolean;
  error: Error | null;
  onAddNew: () => void;
  onEdit: (heroImage: HeroImageItem) => void;
  onRefresh: () => void;
}

export function HeroManager({ heroImages, isLoading, error, onAddNew, onEdit, onRefresh }: HeroManagerProps) {
  const { toast } = useToast();

  const handleDelete = async (heroImageId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hero/${heroImageId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({ title: 'Deleted!', description: 'Hero slide removed successfully.' });
        onRefresh();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Server is not responding.',
        variant: 'destructive'
      });
    }
  };

  /**
   * Helper to get image URL safely
   */
  const getFullImageUrl = (url: string | null | undefined) => {
    if (!url) return 'https://placehold.co/600x400?text=No+Image+Path';
    if (typeof url === 'string' && url.startsWith('http')) return url;
    return `${API_BASE_URL}/uploads/hero/${url}`;
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
      <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
      <p className="font-black uppercase italic tracking-[0.2em] text-[10px] text-slate-400">Syncing Slider Assets...</p>
    </div>
  );

  if (error) return (
    <div className="p-12 text-center border-2 border-red-100 rounded-[2rem] bg-red-50 text-red-600">
      <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
      <p className="font-black uppercase italic tracking-tight">Database Connection Error</p>
      <p className="text-xs mt-1 font-bold opacity-70">{error.message}</p>
    </div>
  );

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between px-0 pb-8 gap-4">
        <div>
          <CardTitle className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <ImageIcon className="h-8 w-8 text-primary" />
            Hero Banner <span className="text-primary">Slides</span>
          </CardTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Total Active Assets: {heroImages?.length || 0}
          </p>
        </div>
        <Button onClick={onAddNew} className="rounded-2xl h-12 px-6 font-black uppercase italic tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="mr-2 h-5 w-5 stroke-[3px]" /> Add New Slide
        </Button>
      </CardHeader>

      <CardContent className="px-0">
        <div className="rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-200/50">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-[180px] py-6 pl-10 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Preview</TableHead>
                <TableHead className="w-[120px] font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Sequence</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Description / Title</TableHead>
                <TableHead className="text-right pr-10 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!heroImages || heroImages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center opacity-10">
                      <ImageIcon size={60} className="mb-4" />
                      <p className="font-black text-xl uppercase italic tracking-tighter">No Active Slides</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                heroImages.map((image) => (
                  <TableRow key={image.id} className="group hover:bg-slate-50/40 transition-colors border-slate-50">
                    <TableCell className="pl-10 py-5">
                      <div className="relative h-24 w-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-100">
                        <img 
                          src={getFullImageUrl(image.imageUrl)} 
                          alt={image.description || 'Hero Image'} 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Asset+Not+Found';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* FIX: Use display_order here */}
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-black italic border border-primary/20">
                        #{image.display_order}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-black text-slate-800 uppercase italic tracking-tight truncate max-w-[250px]">
                        {image.description || "— No Caption —"}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Ref ID: RS-{image.id}</p>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          onClick={() => onEdit(image)}
                          className="h-10 w-10 rounded-xl bg-white border border-slate-200 hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl bg-white border border-slate-200 hover:bg-red-500 hover:text-white text-red-500 transition-all shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Terminate Slide?</AlertDialogTitle>
                              <AlertDialogDescription className="font-bold text-slate-500">
                                This action will permanently scrub this asset from MySQL and your local storage.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4 gap-3">
                              <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] tracking-widest border-none bg-slate-100">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(image.id)} 
                                className="bg-red-500 hover:bg-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest"
                              >
                                Delete Asset
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}