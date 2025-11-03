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

export type Client = {
  name: string;
  ruc: string;
  contact: {
    name: string;
    email: string;
  };
  address: string;
};

export type ActiveVehicle = {
  id: string;
  status: 'Disponible' | 'En tránsito';
  model: string;
  driverId: string;
  otherId: string;
  time: string;
  position: [number, number];
};
