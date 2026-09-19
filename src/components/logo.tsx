'use client';
import { useTranslation } from '@/hooks/use-translation';
import SaffronStripe from './saffron-stripe';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <span className={cn("font-headline text-xl font-bold tracking-tight text-primary", className)}>
        {t('hero_name')}
      </span>
      <SaffronStripe />
    </div>
  );
}
