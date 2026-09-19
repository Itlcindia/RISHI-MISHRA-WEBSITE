import type { Timestamp } from 'firebase/firestore';

export interface GalleryImage {
  imageUrl: string;
  captionEn: string;
  captionHi: string;
  createdAt: Timestamp;
  actionLink1?: string;
  actionLink2?: string;
}
