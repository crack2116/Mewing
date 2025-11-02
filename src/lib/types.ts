export type ServiceRequest = {
  id: string;
  client: {
    id: string;
    name: string;
  };
  details: {
    title: string;
    subtitle: string;
  };
  status: 'Completado' | 'Cancelado' | 'Asignado' | 'Pendiente';
  date: string;
  driverId: string;
};
