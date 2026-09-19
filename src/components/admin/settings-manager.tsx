'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Lock, KeyRound, Shield, 
  CheckCircle2, Loader2, Save, Eye, EyeOff 
} from 'lucide-react';

interface SettingsManagerProps {
  currentAdminUsername: string;
  onUsernameChanged: (newUsername: string) => void;
}

export function SettingsManager({ currentAdminUsername, onUsernameChanged }: SettingsManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Profile Form States
  const [username, setUsername] = useState(currentAdminUsername);
  const [email, setEmail] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Security PIN States
  const [securityPin, setSecurityPin] = useState('');

  // Load current admin settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/admin/settings?username=${encodeURIComponent(currentAdminUsername)}`);
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || currentAdminUsername);
          setEmail(data.email || '');
          setSecurityPin(data.security_pin || '123456');
        }
      } catch (err) {
        console.error('Failed to load admin settings:', err);
      }
    };
    fetchSettings();
  }, [currentAdminUsername]);

  // 1. Update Username & Email
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({ title: 'Error', description: 'Username cannot be empty', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUsername: currentAdminUsername,
          newUsername: username.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: 'Profile Updated', description: 'Username / Email updated successfully.' });
        if (username.trim() !== currentAdminUsername) {
          onUsernameChanged(username.trim());
        }
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err: any) {
      toast({ title: 'Update Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({ title: 'Error', description: 'Please enter your current password.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'New password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUsername: currentAdminUsername,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: 'Password Changed', description: 'Your admin password has been updated securely.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (err: any) {
      toast({ title: 'Password Update Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Update Security Recovery PIN
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityPin.trim()) {
      toast({ title: 'Error', description: 'Security PIN cannot be empty.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUsername: currentAdminUsername,
          securityPin: securityPin.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: 'Recovery PIN Updated', description: 'Security PIN saved successfully.' });
      } else {
        throw new Error(data.message || 'Failed to update PIN');
      }
    } catch (err: any) {
      toast({ title: 'Update Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" /> Admin Account & Security
        </h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
          Manage your Admin credentials, passwords, and password recovery PIN
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARD 1: USERNAME & PROFILE */}
        <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/70 pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Admin Identity
            </CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Change login username & recovery email
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Username (लॉगिन यूजरनेम)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="pl-10 h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white"
                    placeholder="Admin Username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Admin Email
                </label>
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white"
                  placeholder="admin@rishimishra.org"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-md shadow-primary/20"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Identity
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* CARD 2: SECURITY RECOVERY PIN */}
        <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/70 pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" /> Forgot Password PIN
            </CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Secret recovery PIN for password resets
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdatePin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Security Recovery PIN (सीक्रेट पिन)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                  <Input 
                    type="text"
                    value={securityPin} 
                    onChange={(e) => setSecurityPin(e.target.value)} 
                    className="pl-10 h-12 rounded-xl font-mono font-bold tracking-widest text-base bg-amber-50/40 border-amber-200 focus:bg-white"
                    placeholder="e.g. 123456"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed pt-1">
                  💡 यदि आप कभी लॉगिन पासवर्ड भूल जाते हैं, तो लॉगिन स्क्रीन पर "Forgot Password" पर क्लिक करके इस पिन के ज़रिए नया पासवर्ड बना सकते हैं।
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Update Recovery PIN
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* CARD 3: CHANGE PASSWORD (FULL WIDTH) */}
      <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/70 pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Change Password (पासवर्ड बदलें)
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Enter current password and choose a strong new password
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Current Password (वर्तमान पासवर्ड)
                </label>
                <div className="relative">
                  <Input 
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    className="pr-10 h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  New Password (नया पासवर्ड)
                </label>
                <div className="relative">
                  <Input 
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="pr-10 h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white"
                    placeholder="Min 6 characters"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Confirm Password (पुष्टि करें)
                </label>
                <Input 
                  type="password"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={loading} 
                className="h-14 px-8 rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Lock className="h-5 w-5 mr-2" />}
                Commit Password Change
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
