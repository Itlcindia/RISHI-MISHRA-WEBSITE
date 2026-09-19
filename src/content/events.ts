export type EventData = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  locationKey: string;
  date: string;
  imageId: string;
};

export const eventsData: EventData[] = [
  {
    id: 'event-1',
    titleKey: 'event_1_title',
    descriptionKey: 'event_1_desc',
    locationKey: 'event_1_location',
    date: '2024-12-15T10:00:00',
    imageId: 'event-image-1',
  },
  {
    id: 'event-2',
    titleKey: 'event_2_title',
    descriptionKey: 'event_2_desc',
    locationKey: 'event_2_location',
    date: '2025-01-10T14:00:00',
    imageId: 'event-image-2',
  },
  {
    id: 'event-3',
    titleKey: 'event_3_title',
    descriptionKey: 'event_3_desc',
    locationKey: 'event_3_location',
    date: '2025-02-05T11:30:00',
    imageId: 'event-image-3',
  },
];
