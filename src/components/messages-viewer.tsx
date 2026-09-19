'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format, parseISO } from 'date-fns';
import { enUS, hi } from 'date-fns/locale';
import { useTranslation } from '@/hooks/use-translation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2, Mail, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageItem {
  id: number;
  name: string;
  email: string;
  message: string;
  sentAt: string;
}

export function MessagesViewer() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { language } = useTranslation();
  const { toast } = useToast();
  const locale = language === 'hi' ? hi : enUS;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Accordion ko khulne se rokne ke liye
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`${API_URL}/api/messages/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
        toast({ title: "Deleted", description: "Message removed from database." });
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not delete message.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="space-y-4 p-0">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold uppercase tracking-tight text-slate-500 flex items-center gap-2">
          <Mail className="h-5 w-5" /> Recent Inquiries
        </h3>
        <Button variant="outline" size="sm" onClick={fetchMessages} className="rounded-full h-8">
          <RefreshCw className="h-3 w-3 mr-2" /> Refresh
        </Button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-[2rem] bg-slate-50/50">
          <Mail className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium italic">Inbox is currently empty.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {messages.map((msg) => (
            <AccordionItem 
              value={msg.id.toString()} 
              key={msg.id} 
              className="border rounded-2xl px-4 bg-white shadow-sm overflow-hidden"
            >
              <div className="flex items-center w-full">
                <AccordionTrigger className="hover:no-underline flex-1 py-4">
                  <div className="flex flex-col md:flex-row justify-between w-full pr-4 text-left gap-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{msg.name}</span>
                      <span className="text-xs text-slate-400">{msg.email}</span>
                    </div>
                    {msg.sentAt && (
                      <span className="text-slate-400 text-[10px] font-bold uppercase self-start md:self-center">
                        {format(parseISO(msg.sentAt), 'PPp', { locale })}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => handleDelete(msg.id, e)}
                  className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <AccordionContent className="pb-6 pt-2 text-slate-600 leading-relaxed border-t border-slate-50 mt-2 whitespace-pre-wrap">
                <div className="bg-slate-50 p-4 rounded-xl italic">
                  "{msg.message}"
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}