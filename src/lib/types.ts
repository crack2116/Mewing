export type ServiceRequest = {
  id: string;
  client: {
    name: string;
  };
  status: 'Completado' | 'Cancelado' | 'Pendiente';
  date: string;
};
