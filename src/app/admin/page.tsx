'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, LogOut, Newspaper, Calendar, Rocket, 
  Image as ImageIcon, PlusCircle, LayoutDashboard,
  Target, Lock, User, ShieldCheck, Mail, Settings,
  KeyRound, ArrowLeft, Eye, EyeOff, Send, RefreshCw
} from 'lucide-react';

// Managers & Forms
import { NewsManager } from '@/components/news/news-manager';
import { NewsForm } from '@/components/news/news-form';
import { EventsManager } from '@/components/admin/events-manager';
import { EventForm } from '@/components/admin/event-form';
import { InitiativesManager } from '@/components/admin/initiatives-manager';
import { InitiativeForm } from '@/components/admin/initiative-form';
import { HeroManager } from '@/components/admin/hero-manager';
import { HeroForm } from '@/components/admin/hero-form';
import { GalleryManager } from '@/components/admin/gallery-manager';
import { GalleryForm } from '@/components/admin/gallery-form';
import { MessagesViewer } from '@/components/messages-viewer';
import { SettingsManager } from '@/components/admin/settings-manager';

// Environment variable read karein
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api`;

type TabType = 'hero' | 'news' | 'events' | 'initiatives' | 'gallery' | 'messages' | 'settings';

export default function AdminPortal() {
  const { toast } = useToast();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [username, setUsername] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  // Email OTP Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpStep, setOtpStep] = useState<1 | 2>(1); // 1: Request OTP, 2: Verify OTP & Reset
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [dataList, setDataList] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Refresh par login required rahega as requested
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const loadData = useCallback(async () => {
    // Messages and Settings tabs have their own internal fetch logic
    if (!isAuth || activeTab === 'messages' || activeTab === 'settings') return; 
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${activeTab}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setDataList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({ 
        title: "Connection Error", 
        description: "Backend server (MySQL/Express) is not responding.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, isAuth, toast]);

  useEffect(() => {
    if (isAuth) loadData();
  }, [loadData, isAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUsername.trim(), password }),
      });
      const data = await res.json();
      
      if (data.success) {
        setIsAuth(true); 
        const adminUser = data.admin?.username || emailOrUsername.trim();
        setUsername(adminUser);
        toast({ title: "Authorized", description: `Welcome back, ${adminUser}!` });
      } else {
        throw new Error(data.message || "Invalid Admin Credentials");
      }
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resetIdentifier.trim()) {
      toast({ title: "Input Required", description: "Please enter your Username or Registered Email.", variant: "destructive" });
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/admin/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: resetIdentifier.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ 
          title: "OTP Dispatched! ✉️", 
          description: data.message || `An OTP has been sent to your registered email.` 
        });
        setMaskedEmail(data.maskedEmail || '');
        setOtpStep(2);
        setResendCountdown(60);
      } else {
        throw new Error(data.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      toast({ title: "Sending Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast({ title: "OTP Required", description: "Please enter the 6-digit OTP code sent to your email.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password Too Short", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords Do Not Match", description: "New password and confirmation do not match.", variant: "destructive" });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/admin/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: resetIdentifier.trim(),
          otp: otpCode.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ 
          title: "Password Reset Successful! 🎉", 
          description: "Your password has been changed. You can now log in." 
        });
        setIsForgotPassword(false);
        setOtpStep(1);
        setUsername(data.username || resetIdentifier.trim());
        setPassword('');
        setOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(data.message || "Password reset failed");
      }
    } catch (err: any) {
      toast({ title: "Reset Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    const isEditing = !!editingItem;
    const url = isEditing ? `${API_BASE_URL}/${activeTab}/${editingItem.id}` : `${API_BASE_URL}/${activeTab}`;
    
    setIsLoading(true);
    try {
      const res = await fetch(url, { 
        method: isEditing ? 'PUT' : 'POST', 
        body: formData // Note: FormData automatically handles multipart/form-data for images
      });
      
      if (res.ok) {
        toast({ title: "Success", description: `${activeTab} updated successfully.` });
        setIsDialogOpen(false);
        setEditingItem(null);
        loadData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Save operation failed");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuth(false);
    setUsername('');
    setPassword('');
    toast({ title: "Logged Out", description: "Session ended safely." });
    router.refresh();
  };

  if (!mounted) return null;

  // Login Screen
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary p-10 text-center text-white">
            {isForgotPassword ? (
              <>
                <Mail className="mx-auto h-12 w-12 mb-4 text-white/90" />
                <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">
                  {otpStep === 1 ? 'Forgot Password' : 'Verify Email OTP'}
                </CardTitle>
                <p className="text-white/75 text-[10px] font-bold uppercase tracking-[0.25em]">
                  {otpStep === 1 ? 'Email Verification' : 'Enter 6-Digit Code'}
                </p>
              </>
            ) : (
              <>
                <ShieldCheck className="mx-auto h-12 w-12 mb-4 text-white/90" />
                <CardTitle className="text-3xl font-black uppercase tracking-tighter italic">Admin Node</CardTitle>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Identity Verification Required</p>
              </>
            )}
          </CardHeader>
          <CardContent className="p-8 md:p-10 bg-white">
            {isForgotPassword ? (
              otpStep === 1 ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="text-center pb-1">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Enter your Admin Username or Registered Email. We will send a 6-digit OTP code to your inbox.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Username or Registered Email
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <Input 
                        className="pl-12 h-14 rounded-xl bg-slate-50 border-none focus-visible:ring-primary text-sm" 
                        value={resetIdentifier} 
                        onChange={(e) => setResetIdentifier(e.target.value)} 
                        placeholder="e.g. RishiAdmin or admin@domain.com"
                        required 
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-[1.02]" 
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? (
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send OTP to Email / OTP भेजें
                  </Button>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full h-10 rounded-xl text-xs font-bold text-slate-500 uppercase hover:bg-slate-50"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setOtpStep(1);
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                  </Button>
                </form>
              ) : (
                /* Step 2: Verify OTP & Reset Password */
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                    <p className="text-xs text-sky-900 font-medium">
                      OTP dispatched to <span className="font-bold">{maskedEmail}</span>
                    </p>
                    <p className="text-[10px] text-sky-600 mt-0.5">Code expires in 10 minutes</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        6-Digit Email OTP
                      </label>
                      {resendCountdown > 0 ? (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Resend in {resendCountdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          disabled={isSendingOtp}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <RefreshCw size={10} /> Resend OTP / दोबारा भेजें
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <Input 
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary text-center font-mono text-lg tracking-[0.3em] font-black" 
                        value={otpCode} 
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                        placeholder="••••••"
                        maxLength={6}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <Input 
                        type={showResetPass ? "text" : "password"} 
                        className="pl-12 pr-12 h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary text-sm" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        placeholder="At least 6 characters"
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPass(!showResetPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showResetPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <Input 
                        type={showResetPass ? "text" : "password"} 
                        className="pl-12 pr-12 h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary text-sm" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="Repeat new password"
                        required 
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Button 
                      className="w-full h-12 rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-[1.01]" 
                      disabled={isVerifyingOtp}
                    >
                      {isVerifyingOtp ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                      Verify OTP & Reset Password
                    </Button>

                    <div className="flex justify-between items-center pt-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="h-9 px-2 text-[11px] font-bold text-slate-500 uppercase hover:bg-slate-50"
                        onClick={() => setOtpStep(1)}
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Change ID/Email
                      </Button>

                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="h-9 px-2 text-[11px] font-bold text-slate-500 uppercase hover:bg-slate-50"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setOtpStep(1);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              )
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address / ईमेल आईडी</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input 
                      type="text"
                      className="pl-12 h-14 rounded-xl bg-slate-50 border-none focus-visible:ring-primary text-sm" 
                      value={emailOrUsername} 
                      onChange={(e) => setEmailOrUsername(e.target.value)} 
                      placeholder="admin@domain.com (or Username)"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetIdentifier(emailOrUsername || 'rishi@example.com');
                        setIsForgotPassword(true);
                        setOtpStep(1);
                        setOtpCode('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Forgot? / भूल गए?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input 
                      type="password" 
                      className="pl-12 h-14 rounded-xl bg-slate-50 border-none focus-visible:ring-primary" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••"
                      required 
                    />
                  </div>
                </div>
                <Button className="w-full h-14 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-[1.02]" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Authorize Access"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-100 p-6 sticky top-0 h-screen flex flex-col bg-white">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2.5 bg-primary rounded-xl text-white shadow-lg">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="font-black text-xl uppercase tracking-tighter text-slate-900">NGO Panel</h1>
            <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest italic flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              MySQL Live
            </p>
          </div>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          <SidebarBtn id="hero" label="Hero Slides" icon={Rocket} active={activeTab} onClick={setActiveTab} />
          <SidebarBtn id="news" label="News Manager" icon={Newspaper} active={activeTab} onClick={setActiveTab} />
          <SidebarBtn id="events" label="Events" icon={Calendar} active={activeTab} onClick={setActiveTab} />
          <SidebarBtn id="initiatives" label="Initiatives" icon={Target} active={activeTab} onClick={setActiveTab} />
          <SidebarBtn id="gallery" label="Gallery" icon={ImageIcon} active={activeTab} onClick={setActiveTab} />
          <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
             <SidebarBtn id="messages" label="Messages" icon={Mail} active={activeTab} onClick={setActiveTab} />
             <SidebarBtn id="settings" label="Settings" icon={Settings} active={activeTab} onClick={setActiveTab} />
          </div>
        </nav>

        <Button 
            variant="ghost" 
            className="mt-auto w-full text-red-500 hover:bg-red-50 font-bold uppercase tracking-widest text-[10px] rounded-xl py-6" 
            onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" /> Terminate Session
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-[#FBFDFF] overflow-y-auto">
        <header className="flex justify-between items-end mb-10">
          <div className="space-y-1">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Management Console</p>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
              Manage <span className="text-primary not-italic">{activeTab}</span>
            </h2>
          </div>
          
          {activeTab !== 'messages' && activeTab !== 'settings' && (
            <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }} className="rounded-xl h-12 px-6 font-bold uppercase shadow-md transition-all hover:shadow-primary/20">
              <PlusCircle className="mr-2 h-5 w-5" /> New Entry
            </Button>
          )}
        </header>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm min-h-[60vh] overflow-hidden">
          {isLoading && activeTab !== 'messages' && activeTab !== 'settings' ? (
            <div className="h-[500px] flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary/40 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing with MySQL...</p>
            </div>
          ) : (
            <div className="p-8">
              {activeTab === 'hero' && <HeroManager heroImages={dataList} onEdit={(item) => { setEditingItem(item); setIsDialogOpen(true); }} onRefresh={loadData} isLoading={isLoading} />}
              {activeTab === 'news' && <NewsManager news={dataList} onEdit={(item) => { setEditingItem(item); setIsDialogOpen(true); }} onRefresh={loadData} isLoading={isLoading} />}
              {activeTab === 'events' && <EventsManager events={dataList} onEdit={(item) => { setEditingItem(item); setIsDialogOpen(true); }} onRefresh={loadData} isLoading={isLoading} />}
              {activeTab === 'initiatives' && <InitiativesManager initiatives={dataList} onEdit={(item) => { setEditingItem(item); setIsDialogOpen(true); }} onRefresh={loadData} isLoading={isLoading} />}
              {activeTab === 'gallery' && <GalleryManager gallery={dataList} onEdit={(item) => { setEditingItem(item); setIsDialogOpen(true); }} onRefresh={loadData} isLoading={isLoading} />}
              {activeTab === 'messages' && <MessagesViewer />}
              {activeTab === 'settings' && <SettingsManager currentAdminUsername={username} onUsernameChanged={setUsername} />}
            </div>
          )}
        </div>
      </main>

      {/* Forms Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 border-none overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-8 text-white">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              {editingItem ? 'Update' : 'Generate'} <span className="text-primary">{activeTab}</span>
            </DialogTitle>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Fill all mandatory fields</p>
          </div>
          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {activeTab === 'news' && <NewsForm article={editingItem} onSave={handleSave} />}
            {activeTab === 'events' && <EventForm event={editingItem} onSave={handleSave} />}
            {activeTab === 'initiatives' && <InitiativeForm initiative={editingItem} onSave={handleSave} />}
            {activeTab === 'hero' && <HeroForm heroImage={editingItem} onSave={handleSave} />}
            {activeTab === 'gallery' && <GalleryForm galleryImage={editingItem} onSave={handleSave} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sidebar Button Sub-component
function SidebarBtn({ id, label, icon: Icon, active, onClick }: any) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold uppercase text-[11px] transition-all duration-200 ${
        isActive 
          ? 'bg-primary text-white shadow-lg translate-x-1' 
          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className={`h-4 w-4 ${isActive ? 'scale-110' : ''}`} />
      <span>{label}</span>
    </button>
  );
}