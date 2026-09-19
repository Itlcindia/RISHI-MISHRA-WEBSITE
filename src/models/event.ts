import type { Timestamp } from 'firebase/firestore';

export interface Event {
  eventName: string;
  date: Timestamp;
  location: string;
  descriptionHi: string;
  imageUrl: string;
}
