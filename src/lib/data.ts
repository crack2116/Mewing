import type { ServiceRequest } from './types';
import { PlaceHolderImages } from './placeholder-images';

const clientImages = PlaceHolderImages.filter(img => img.id.startsWith('client-'));

export const serviceRequests: ServiceRequest[] = [
  {
    id: 'SR-001',
    client: { name: 'Alice Johnson', avatarUrl: clientImages[0]?.imageUrl || '' },
    status: 'Completed',
    date: '2023-10-26',
  },
  {
    id: 'SR-002',
    client: { name: 'Bob Williams', avatarUrl: clientImages[1]?.imageUrl || '' },
    status: 'In Progress',
    date: '2023-10-25',
  },
  {
    id: 'SR-003',
    client: { name: 'Charlie Brown', avatarUrl: clientImages[2]?.imageUrl || '' },
    status: 'Pending',
    date: '2023-10-25',
  },
  {
    id: 'SR-004',
    client: { name: 'Diana Miller', avatarUrl: clientImages[3]?.imageUrl || '' },
    status: 'Delayed',
    date: '2023-10-24',
  },
  {
    id: 'SR-005',
    client: { name: 'Ethan Davis', avatarUrl: clientImages[4]?.imageUrl || '' },
    status: 'Completed',
    date: '2023-10-23',
  },
    {
    id: 'SR-006',
    client: { name: 'Fiona Garcia', avatarUrl: clientImages[0]?.imageUrl || '' },
    status: 'Pending',
    date: '2023-10-22',
  },
];

export const overviewData = {
  totalRevenue: 125430,
  servicesInProgress: 12,
  completedServices: 342,
  pendingRequests: 5,
};
