import type { ServiceRequest, Client } from './types';

export const serviceRequests: ServiceRequest[] = [
  {
    id: '3228F0i',
    client: { id: 'UI0005', name: 'Logística Integral S.A.' },
    details: {
      title: 'Almacén Central - Av. Panamericana Sur Km 15',
      subtitle: 'a Logística Integral S.A. - Av. Panamericana Sur Km 15, Villa El Salvador',
    },
    status: 'Completado',
    date: '19/1/2025',
    driverId: 'C0005',
  },
  {
    id: '6tgS93S',
    client: { id: 'sdsdd223', name: 'sullana' },
    details: {
      title: 'mall plaza',
      subtitle: 'a sullana',
    },
    status: 'Cancelado',
    date: '22/11/2025',
    driverId: 'C0001',
  },
  {
    id: '8ARIJan',
    client: { id: 'UI0001', name: 'Distribuidora Lima Norte S.A.C.' },
    details: {
      title: 'Puerto del Callao - Terminal Portuario',
      subtitle: 'a Distribuidora Lima Norte S.A.C. - Av. Túpac Amaru 1234, Independencia',
    },
    status: 'Completado',
    date: '15/1/2025',
    driverId: 'C0001',
  },
  {
    id: 'Ikjp29G',
    client: { id: 'UI0007', name: 'Distribuidora Central S.A.C.' },
    details: {
      title: 'Mercado Central - Lima Cercado',
      subtitle: 'a Distribuidora Central S.A.C. - Av. Abancay 456, Lima Cercado',
    },
    status: 'Asignado',
    date: '25/1/2025',
    driverId: 'C0007',
  },
  {
    id: 'KJKg2PT',
    client: { id: '172833', name: 'cajamarca' },
    details: {
      title: 'miraflores',
      subtitle: 'a cajamarca',
    },
    status: 'Asignado',
    date: '28/1/2025',
    driverId: 'C0001',
  },
  {
    id: 'NiXyfJb',
    client: { id: 'UI0007', name: 'Distribuidora Central S.A.C.' },
    details: {
      title: 'Mercado Central - Lima Cercado',
      subtitle: 'a Distribuidora Central S.A.C. - Av. Abancay 456, Lima Cercado',
    },
    status: 'Asignado',
    date: '30/1/2025',
    driverId: 'C0007',
  },
];

export const overviewData = {
  totalRevenue: 900,
  servicesInProgress: 4,
  completedServices: 6,
  pendingRequests: 4,
};

export const clients: Client[] = [
    {
      name: 'Logística Express S.A.C.',
      ruc: '20123456802',
      contact: {
        name: 'Antonio José Delgado',
        email: 'antonio.delgado@express.com',
      },
      address: 'Av. Circunvalación 369, Comas, Lima',
    },
    {
      name: 'Distribuidora Lima Norte S.A.C.',
      ruc: '20123456789',
      contact: {
        name: 'María Elena Rodríguez',
        email: 'maria.rodriguez@limanorte.com',
      },
      address: 'Av. Túpac Amaru 1234, Independencia, Lima',
    },
    {
        name: 'Distribuidora Oeste E.I.R.L.',
        ruc: '20123456800',
        contact: {
            name: 'Jorge Luis Paredes',
            email: 'jorge.paredes@oeste.com',
        },
        address: 'Av. Mariscal Castilla 147, San Juan de Lurigancho, Lima',
    }
  ];
