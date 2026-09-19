import type { Metadata } from 'next';
import { Poppins, Hind } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { LanguageProvider } from '@/context/language-context';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import WhatsAppFAB from '@/components/whatsapp-fab';
import { Toaster } from '@/components/ui/toaster';

// 1. Keep the fonts as they were
const fontPoppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '700'],
});

const fontHind = Hind({
  subsets: ['devanagari', 'latin'],
  display: 'swap',
  variable: '--font-hind',
  weight: ['400', '600'],
});

// 2. SEO Metadata remains the same
export const metadata: Metadata = {
  title: {
    default: 'Rishi Mishra | Advocate, Social Worker, Founder - Sonchiraiya NGO',
    template: '%s | Rishi Mishra Official',
  },
  description: 'Official website of Rishi Mishra, an advocate and social worker active in Sarojini Nagar & Lucknow, Uttar Pradesh.',
  keywords: ['Rishi Mishra', 'Sarojini Nagar Lucknow', 'Sonchiraiya NGO', 'BKU', 'advocate Lucknow'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-body antialiased', fontPoppins.variable, fontHind.variable)}>
        {/* Removed FirebaseClientProvider since you are using MySQL */}
        <LanguageProvider>
          <div className="relative flex min-h-dvh flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppFAB />
            <Toaster />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}