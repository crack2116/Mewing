export type ServiceRequest = {
  id: string;
  client: {
    name: string;
    avatarUrl: string;
  };
  status: 'Completed' | 'In Progress' | 'Pending' | 'Delayed';
  date: string;
};
