import type { Timestamp } from 'firebase/firestore';

export interface News {
  titleEn: string;
  titleHi: string;
  contentHi: string;
  imageUrl: string;
  timestamp: Timestamp;
  category: string;
}
