'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Loader2, ImageOff, ImageIcon, Layers, Tag } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface GalleryItem {
  id: number;
  image: string; // JSON string from DB
  title: string;
  category: string;
  created_at: string;
}

interface GalleryManagerProps {
  gallery: GalleryItem[] | null;
  isLoading?: boolean;
  onEdit: (item: GalleryItem) => void;
  onRefresh: () => void;
}

export function GalleryManager({ gallery = [], isLoading, onEdit, onRefresh }: GalleryManagerProps) {
  const { toast } = useToast();

  // Helper function to safely parse images
  const getImages = (imageData: any): string[] => {
    try {
      if (!imageData) return [];
      const parsed = typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.error("Parsing Error:", e);
      return [];
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Collection Removed', description: 'Album and its files deleted.' });
        onRefresh();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete asset.', variant: 'destructive' });
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
      <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
      <p className="font-black uppercase italic tracking-widest text-[10px] text-slate-400">Syncing Media Repository...</p>
    </div>
  );

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between px-0 pb-8 gap-4">
        <div>
          <CardTitle className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-4">
            <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/20 text-white">
              <ImageIcon className="h-8 w-8" />
            </div>
            Media <span className="text-primary">Vault</span>
          </CardTitle>
          <div className="flex items-center gap-4 mt-3">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1 rounded-full">
               Total Albums: <span className="text-slate-900 font-black">{gallery?.length || 0}</span>
             </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-0">
        <div className="rounded-[3rem] border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-200/40">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-[300px] py-8 pl-10 font-black text-slate-400 uppercase text-[10px] tracking-widest">Stack Preview</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Collection Meta</TableHead>
                <TableHead className="text-right pr-10 font-black text-slate-400 uppercase text-[10px] tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!gallery || gallery.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center opacity-20">
                      <ImageOff size={64} className="mb-4 text-slate-400" />
                      <p className="font-black text-xl uppercase italic tracking-tighter">Repository Empty</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                gallery.map((item) => {
                  const images = getImages(item.image);
                  return (
                    <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-all border-slate-50">
                      <TableCell className="pl-10 py-8">
                        {/* Interactive Image Stack */}
                        <div className="relative h-28 w-48 flex items-center">
                          {images.slice(0, 3).map((img, idx) => (
                            <div 
                              key={idx} 
                              className="absolute h-24 w-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl transition-all duration-500 group-hover:translate-x-[20px]"
                              style={{ 
                                left: `${idx * 25}px`, 
                                zIndex: 10 - idx,
                                transform: `rotate(${idx * -6 + 3}deg) group-hover:rotate(0deg)`
                              }}
                            >
                              <img 
                                src={`${API_BASE_URL}/uploads/gallery/${img}`} 
                                className="h-full w-full object-cover" 
                                alt="Stack preview"
                                onError={(e) => {(e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Missing'}}
                              />
                            </div>
                          ))}
                          {images.length > 3 && (
                            <div 
                              className="absolute h-24 w-32 rounded-2xl bg-slate-900/90 backdrop-blur-sm text-white flex flex-col items-center justify-center border-4 border-white shadow-xl"
                              style={{ left: '75px', zIndex: 1 }}
                            >
                              <span className="text-xl font-black">+{images.length - 3}</span>
                              <span className="text-[8px] font-bold uppercase tracking-widest">More</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-wider">
                              <Tag size={10} /> {item.category || 'General'}
                            </span>
                            <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-wider">
                              <Layers size={10} /> {images.length} Assets
                            </span>
                          </div>
                          <div>
                            <p className="text-xl font-black uppercase italic tracking-tight text-slate-800 leading-none">
                              {item.title}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
                              Stored: {new Date(item.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right pr-10">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            onClick={() => onEdit(item)} 
                            className="h-12 w-12 rounded-2xl bg-white border-2 border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-12 w-12 rounded-2xl bg-white border-2 border-slate-100 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-500 transition-all shadow-sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[3rem] border-none shadow-2xl p-8">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-red-600">Flush Collection?</AlertDialogTitle>
                                <AlertDialogDescription className="font-bold text-slate-500 text-base">
                                  This will permanently remove <span className="text-slate-900">"{item.title}"</span> and all {images.length} physical files from the server.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-8 gap-4">
                                <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2">Keep Collection</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(item.id)} 
                                  className="h-14 bg-red-600 hover:bg-red-700 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-red-200"
                                >
                                  Delete Everything
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}