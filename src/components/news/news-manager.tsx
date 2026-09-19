'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { format, isValid, parseISO } from 'date-fns';
import { enUS, hi } from 'date-fns/locale';
import { useTranslation } from '@/hooks/use-translation';
import { Edit2, Trash2, PlusCircle, RefreshCw, ImageIcon, Newspaper, AlertCircle, Loader2, Layers } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface NewsItem {
  id: number;
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
  images?: string | string[]; // Updated for Multiple Images
  category?: string;
  publishDate: string; // Updated from created_at to use our new column
}

interface NewsManagerProps {
  news: NewsItem[] | null;
  isLoading?: boolean;
  error?: any;
  onAddNew?: () => void;
  onEdit: (article: NewsItem) => void;
  onRefresh: () => void;
}

export function NewsManager({ 
  news = [], 
  isLoading, 
  error, 
  onAddNew, 
  onEdit, 
  onRefresh 
}: NewsManagerProps) {
  const { toast } = useToast();
  const { language } = useTranslation();
  const locale = language === 'hi' ? hi : enUS;

  const handleDelete = async (articleId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/${articleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: language === 'hi' ? 'सफलतापूर्वक हटाया गया' : 'Deleted Successfully',
          description: language === 'hi' ? 'लेख हटा दिया गया है।' : 'The article was removed.',
        });
        onRefresh();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Connection failed.',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, 'PPP', { locale }) : '---';
  };

  // Multiple Image Parser Utility
  const getMediaInfo = (images: any) => {
    try {
      if (!images) return { count: 0, exists: false };
      const parsed = typeof images === 'string' ? JSON.parse(images) : images;
      return { 
        count: Array.isArray(parsed) ? parsed.length : 0, 
        exists: Array.isArray(parsed) && parsed.length > 0 
      };
    } catch (e) {
      return { count: 0, exists: false };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-[10px] font-black uppercase italic tracking-[0.2em] text-slate-400">Syncing Multiple Assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-red-50/50 border-2 border-dashed border-red-200 rounded-[3rem]">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-red-600 uppercase italic tracking-tighter">Database Link Broken</h3>
        <p className="text-slate-500 font-bold text-sm mb-8">Could not fetch news feed from rs_db.</p>
        <Button onClick={onRefresh} variant="destructive" className="rounded-2xl px-10 h-14 font-black uppercase italic tracking-widest shadow-xl shadow-red-500/20">
          <RefreshCw className="h-5 w-5 mr-3" /> Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between px-0 pb-10 gap-4">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-[1.8rem] shadow-xl shadow-primary/20">
            <Newspaper className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
              News <span className="text-primary">Engine</span>
            </CardTitle>
            <CardDescription className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] mt-2 block">
              Managing {news?.length || 0} Dynamic Records with Multi-Asset Support
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={onRefresh} className="rounded-2xl h-14 w-14 bg-white hover:bg-slate-50 border-slate-200 shadow-sm transition-all active:scale-90">
            <RefreshCw className="h-5 w-5 text-slate-500" />
          </Button>
          <Button onClick={onAddNew} className="rounded-2xl h-14 px-8 font-black uppercase italic tracking-widest shadow-2xl shadow-primary/30 hover:translate-y-[-2px] transition-all bg-primary">
            <PlusCircle className="mr-3 h-5 w-5 stroke-[3px]" /> New Article
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-0">
        <div className="rounded-[3rem] border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-200/40">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="w-[45%] font-black uppercase text-[10px] tracking-widest py-8 pl-10 text-slate-400">Headline & Content</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-center text-slate-400">Section</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-center text-slate-400">Assets</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-center text-slate-400">Schedule</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest pr-10 text-slate-400">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news && news.length > 0 ? (
                news.map((article) => {
                  const media = getMediaInfo(article.images);
                  return (
                    <TableRow key={article.id} className="group hover:bg-slate-50/60 transition-colors border-slate-50">
                      <TableCell className="py-7 pl-10">
                        <div className="flex flex-col space-y-1.5">
                          <span className="font-black text-lg text-slate-800 uppercase italic tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {article.titleEn}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 line-clamp-1 font-hindi opacity-80">
                            {article.titleHi}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="rounded-xl font-black text-[9px] uppercase tracking-widest bg-white border-slate-200 text-slate-600 px-4 py-2 shadow-sm border">
                          {article.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          {media.exists ? (
                            <div className="flex items-center gap-2 text-primary bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                              <Layers className="h-4 w-4" />
                              <span className="text-[10px] font-black tracking-tighter">{media.count} Files</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-300 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 italic">
                              <ImageIcon className="h-4 w-4" />
                              <span className="text-[9px] font-black uppercase tracking-tighter">No Media</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex flex-col items-center bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                             {formatDate(article.publishDate)}
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex justify-end gap-3">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-12 w-12 rounded-2xl bg-white border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm group/btn"
                            onClick={() => onEdit(article)}
                          >
                            <Edit2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-12 w-12 rounded-2xl bg-white border border-slate-100 hover:bg-red-500 hover:text-white transition-all text-red-500 shadow-sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[3rem] border-none shadow-3xl p-8">
                              <AlertDialogHeader>
                                <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                                   <Trash2 className="h-8 w-8 text-red-500" />
                                </div>
                                <AlertDialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Erase Content?</AlertDialogTitle>
                                <AlertDialogDescription className="font-bold text-slate-500 mt-2 text-base">
                                  This will permanently delete this article and its {media.count} associated images from the cloud.
                                  <div className="block font-black text-red-500 mt-6 p-6 bg-red-50/50 rounded-[2rem] border-2 border-dashed border-red-100 italic text-sm">
                                    "{article.titleEn}"
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-8 gap-3">
                                <AlertDialogCancel className="rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest border-slate-200">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(article.id)} 
                                  className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-14 font-black uppercase text-[10px] px-10 tracking-widest shadow-xl shadow-red-500/20"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center opacity-10">
                      <Newspaper size={100} className="mb-4" />
                      <h3 className="font-black text-3xl uppercase italic tracking-tighter">No Articles Synced</h3>
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