
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Mail, X } from 'lucide-react';

import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import Logo from '../logo';

export default function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/about', label: t('nav_about') },
    { href: '/initiatives', label: t('nav_initiatives') },
    { href: '/gallery', label: t('nav_gallery') },
    { href: '/news', label: t('nav_news') },
    { href: '/events', label: t('nav_events') },
  ];

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20',
        pathname === href ? 'bg-white/20' : ''
      )}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all',
        isScrolled
          ? 'border-white/10 bg-primary/80 text-primary-foreground shadow-md backdrop-blur-lg'
          : 'border-transparent bg-gradient-to-b from-black/50 to-transparent text-white'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between relative px-4 md:px-6">
        <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Logo className={cn(isScrolled ? "text-primary-foreground" : "text-white")} />
            </Link>
        </div>

        <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
             <div className="hidden md:block">
                <Button asChild className="rounded-full">
                    <Link href="/contact" className="flex items-center gap-2">
                        {t('nav_contact')}
                        <Mail className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="flex items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-white/20 focus-visible:bg-white/20 text-inherit">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-sm bg-primary text-primary-foreground border-r-0 p-0">
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-white/20 p-6">
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                          <Logo className="text-primary-foreground" />
                      </Link>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                          <X className="h-6 w-6" />
                        </Button>
                      </SheetClose>
                    </div>
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                    <nav className="flex flex-1 flex-col justify-between gap-4 p-6">
                      <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'rounded-xl p-4 text-xl font-bold transition-all hover:bg-white/10 active:scale-95',
                                pathname === link.href ? 'bg-white/20' : ''
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                            >
                            {link.label}
                            </Link>
                        ))}
                      </div>
                      <div className="mt-auto">
                        <Button asChild size="lg" className="w-full rounded-2xl h-16 text-lg font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                            <Link href="/contact" className="flex items-center justify-center gap-3">
                                {t('nav_contact')}
                                <Mail className="h-5 w-5" />
                            </Link>
                        </Button>
                      </div>
                    </nav>
                </div>
                </SheetContent>
            </Sheet>
            </div>
        </div>

      </div>
    </header>
  );
}
