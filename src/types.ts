export interface Product {
  id: string;
  name: string;
  category: 'Speakers' | 'Acoustic Panels' | 'Cables' | 'Amplifiers' | 'Accessories';
  stock: number;
  unitPrice: number;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  totalSpent: number;
  outstandingBalance: number;
}

export interface Project {
  id: string;
  customerId: string;
  customerName?: string;
  title: string;
  status: 'Quoted' | 'In-Progress' | 'Completed' | 'Billed';
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  customerId: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'user';
}
