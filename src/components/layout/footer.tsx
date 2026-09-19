'use client';

import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Leaf } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/about', label: t('nav_about') },
    { href: '/initiatives', label: t('nav_initiatives') },
    { href: '/gallery', label: t('nav_gallery') },
    { href: '/news', label: t('nav_news') },
    { href: '/events', label: t('nav_events') },
    { href: '/contact', label: t('nav_contact') },
  ];

  return (
    <footer className="relative w-full overflow-hidden bg-primary text-white mt-12 md:mt-20 rounded-t-[3rem] lg:rounded-t-[6rem] shadow-2xl border-t-8 border-saffron/20">
      {/* Agricultural Motifs Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        data-ai-hint="indian fields agriculture"
      />
      
      {/* Decorative Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-saffron/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-accent/10 rounded-full blur-[120px] translate-y-1/2" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-8 md:pb-12">
        <div className="grid gap-12 md:gap-16 lg:grid-cols-12">
          {/* Main Brand & Vision */}
          <div className="lg:col-span-5 space-y-8 md:space-y-10 text-center lg:text-left">
            <div className="space-y-4 md:space-y-6">
              <Link href="/" className="inline-block group">
                <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white transition-all group-hover:text-saffron">
                  {t('hero_name')}
                </h2>
                <div className="flex justify-center lg:justify-start gap-1 mt-3">
                  <div className="h-2 w-16 md:w-20 bg-saffron rounded-full" />
                  <div className="h-2 w-4 bg-white/20 rounded-full" />
                </div>
              </Link>
              <p className="text-xl md:text-2xl font-bold italic text-white/90 leading-[1.1] max-w-md mx-auto lg:mx-0">
                "{t('footer_tagline')}"
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-3 text-white/40 font-black uppercase text-[9px] md:text-[10px] tracking-[0.3em]">
                <Leaf className="h-4 w-4 text-saffron fill-saffron" />
                <span>Serving Sarojini Nagar & Lucknow</span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-start space-x-4">
              <SocialIcon href="https://www.facebook.com/rishi.mishra.5623/" icon={<Facebook className="h-5 w-5" />} />
              <SocialIcon href="#" icon={<Twitter className="h-5 w-5" />} />
              <SocialIcon href="https://www.instagram.com/rishimishralko" icon={<Instagram className="h-5 w-5" />} />
              <SocialIcon href="https://youtube.com/@rishimishralko?si=oMrgiIFFXHDMXmo9" icon={<Youtube className="h-5 w-5" />} />
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid gap-10 sm:grid-cols-2 lg:grid-cols-2 text-center sm:text-left">
            <div className="space-y-6 md:space-y-8">
              <h3 className="font-headline text-xs font-black uppercase tracking-[0.3em] text-saffron/80">
                Navigation
              </h3>
              <ul className="space-y-3 md:space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-white/60 hover:text-white transition-all font-bold flex items-center justify-center sm:justify-start gap-0 hover:gap-3 group"
                    >
                      <span className="h-1.5 w-0 bg-saffron group-hover:w-4 transition-all rounded-full hidden sm:block" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 md:space-y-8">
              <h3 className="font-headline text-xs font-black uppercase tracking-[0.3em] text-saffron/80">
                Connect Directly
              </h3>
              <ul className="space-y-4 md:space-y-6">
                <ContactItem 
                  icon={<Mail className="h-5 w-5" />} 
                  label="Email Support" 
                  value="contact@rishimishra.com" 
                  href="mailto:contact@rishimishra.com" 
                />
                <ContactItem 
                  icon={<Phone className="h-5 w-5" />} 
                  label="Office Helpline" 
                  value="+91 8874620222" 
                  href="tel:+918874620222" 
                />
                <ContactItem 
                  icon={<MapPin className="h-5 w-5" />} 
                  label="Constituency Office" 
                  value={
                    <>
                      kalli pashchim, near kisan path,<br />
                      raebareli road, sarojini nagar, lucknow
                    </>
                  } 
                />
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 md:mt-32 pt-8 md:pt-12 border-t border-white/5 text-center sm:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <div className="h-1 w-12 bg-saffron rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Official Portal</p>
              </div>
              <p className="text-[10px] md:text-[11px] font-bold text-white/20 uppercase tracking-widest">
                &copy; {year} {t('footer_copyright')}
              </p>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                Website Design by <a href="https://itlcindia.com/" target="_blank" rel="noopener noreferrer" className="text-saffron hover:underline">ITLC INDIA PVT LTD</a>
              </div>
            </div>
            
            <div className="bg-white/5 px-6 py-3 rounded-full border border-white/5 backdrop-blur-md w-full sm:w-auto">
              <p className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">
                {t('footer_disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      asChild 
      className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl border-white/10 bg-white/5 text-white hover:bg-saffron hover:text-white hover:border-saffron transition-all hover:-translate-y-2 shadow-lg"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
    </Button>
  );
}

function ContactItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: React.ReactNode; href?: string }) {
  const content = (
    <div className="flex items-start justify-center sm:justify-start gap-4 md:gap-5 group cursor-pointer">
      <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-saffron border border-white/10 group-hover:bg-saffron group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-xl">
        {icon}
      </div>
      <div className="space-y-0.5 text-left">
        <span className="block text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{label}</span>
        <div className="block text-xs md:text-sm font-bold text-white/70 group-hover:text-white transition-colors">
          {value}
        </div>
      </div>
    </div>
  );

  return href ? <a href={href} className="block">{content}</a> : content;
}
