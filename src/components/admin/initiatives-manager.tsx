'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit3, Trash2, PlusCircle, LayoutList, Loader2, ImageIcon, ExternalLink } from 'lucide-react';

// Environment variable connection
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface InitiativeItem {
  id: number;
  slug: string;
  titleHi: string;
  titleEn: string;
  image: string;
  display_order: number;
}

interface InitiativesManagerProps {
  initiatives: InitiativeItem[] | null;
  isLoading?: boolean;
  error?: any;
  onAddNew?: () => void;
  onEdit: (initiative: InitiativeItem) => void;
  onRefresh: () => void;
}

export function InitiativesManager({ 
  initiatives = [], 
  isLoading, 
  error, 
  onAddNew, 
  onEdit, 
  onRefresh 
}: InitiativesManagerProps) {
  const { toast } = useToast();
  
  const handleDelete = async (initiativeId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/initiatives/${initiativeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Initiative removed from server.',
        });
        onRefresh();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      toast({
        title: 'Network Error',
        description: 'Check your database connection.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-[10px] font-black uppercase italic tracking-[0.2em] text-slate-400">Syncing Mission Assets...</p>
    </div>
  );

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between px-0 pb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-[1.5rem] shadow-inner">
            <LayoutList className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
              Core <span className="text-primary">Initiatives</span>
            </CardTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
              Bilingual Content Management System
            </p>
          </div>
        </div>
        <Button onClick={onAddNew} className="rounded-2xl h-14 px-8 font-black uppercase italic tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          <PlusCircle className="mr-2 h-5 w-5 stroke-[3px]" /> New Mission
        </Button>
      </CardHeader>
      
      <CardContent className="px-0">
        <div className="rounded-[3rem] border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-200/50">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-none">
                <TableHead className="w-[100px] text-center font-black uppercase text-[10px] tracking-widest py-8 pl-10">Order</TableHead>
                <TableHead className="w-[120px] font-black uppercase text-[10px] tracking-widest">Visual</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Identity (Hi / En)</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Routing</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest pr-10">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initiatives && initiatives.length > 0 ? (
                [...initiatives].sort((a, b) => a.display_order - b.display_order).map((item) => (
                  <TableRow key={item.id} className="group hover:bg-slate-50/40 transition-colors border-slate-50">
                    <TableCell className="text-center pl-10">
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-slate-900 text-white font-black italic shadow-lg">
                        {item.display_order}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-16 w-16 rounded-[1.2rem] border-4 border-white shadow-xl overflow-hidden bg-slate-100 ring-1 ring-slate-100">
                        {item.image ? (
                          <img 
                            src={`${API_BASE_URL}/uploads/initiatives/${item.image}`} 
                            className="h-full w-full object-cover group-hover:scale-125 transition-transform duration-700" 
                            alt={item.titleEn} 
                            onError={(e) => {(e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=?';}}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center opacity-10">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-lg font-black text-slate-800 uppercase italic tracking-tight leading-none">{item.titleHi}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.titleEn}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-[9px] bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full border border-slate-200">
                          /{item.slug}
                        </code>
                        <ExternalLink size={12} className="text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-12 w-12 rounded-2xl bg-white border border-slate-200 hover:bg-primary hover:text-white transition-all shadow-sm" 
                          onClick={() => onEdit(item)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-12 w-12 rounded-2xl bg-white border border-slate-200 hover:bg-red-500 hover:text-white transition-all text-red-500 shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-red-600">Terminate initiative?</AlertDialogTitle>
                              <AlertDialogDescription className="font-bold text-slate-500">
                                This will remove the <strong>{item.titleEn}</strong> section from the live NGO portal and delete its assets from MySQL.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4 gap-3">
                              <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] tracking-widest">Abort</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(item.id)} 
                                className="bg-red-500 hover:bg-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest px-6"
                              >
                                Delete Mission
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
                  <TableCell colSpan={5} className="h-80 text-center">
                    <div className="flex flex-col items-center justify-center opacity-10">
                      <LayoutList size={80} className="mb-4" />
                      <p className="font-black text-2xl uppercase italic tracking-tighter">Mission List Empty</p>
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