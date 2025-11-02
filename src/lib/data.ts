import type { ServiceRequest } from './types';

export const serviceRequests: ServiceRequest[] = [
  {
    id: 'UI0005',
    client: { name: 'Logística Integral S.A. - Av. Panamericana Sur Km 15, Villa El Salvador' },
    status: 'Completado',
    date: '19/1/2025',
  },
  {
    id: 'sdsdd223',
    client: { name: 'sullana' },
    status: 'Cancelado',
    date: '22/11/2025',
  },
  {
    id: 'UI0001',
    client: { name: 'Distribuidora Lima Norte S.A.C. - Av. Túpac Amaru 1234, Independencia' },
    status: 'Completado',
    date: '15/1/2025',
  },
];

export const overviewData = {
  totalRevenue: 900,
  servicesInProgress: 4,
  completedServices: 6,
  pendingRequests: 4,
};
