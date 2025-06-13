export interface Client {
  id: number;
  name: string;
  email: string;
  company?: string | null;
}

export interface Invoice {
  id: number;
  clientId: number;
  amount: number;
  dueDate: string;
  paid: boolean;
  client?: Client;
}

export interface User {
  id: number;
  email: string;
  name: string;
}